import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { Batch } from 'src/entity/batch.entity';
import { AppDataSource } from 'src/data-source';
import { InventoryService } from 'src/inventory/inventory.service';
import { StockAlertService } from 'src/stockalert/stockalert.service';

@Injectable()
export class BatchService {
    private batchRepository: Repository<Batch>;

    constructor(
        private readonly inventoryService: InventoryService,
        private readonly stockAlertService: StockAlertService
    ) {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.batchRepository = AppDataSource.getRepository(Batch);
    }

    // Crea un nuevo lote y actualiza el inventario global
    async createBatch(batch: Batch): Promise<Batch> {
        if (batch.cantidad_disponible === undefined) {
            batch.cantidad_disponible = batch.cantidad_inicial;
        }
        if (!batch.estado_lote) {
            batch.estado_lote = 'activo';
        }

        const newBatch = await this.batchRepository.save(batch);
        await this.syncInventoryStock(newBatch.id_producto);

        return newBatch;
    }

    // Obtiene todos los lotes registrados
    async getAllBatches(): Promise<Batch[]> {
        return await this.batchRepository.find({ relations: ['product', 'supplier'] });
    }

    // Busca un lote específico por ID
    async getBatchById(id_lote: number): Promise<Batch> {
        const batch = await this.batchRepository.findOne({ where: { id_lote }, relations: ['product', 'supplier'] });
        if (!batch) throw new NotFoundException(`Lote ${id_lote} no encontrado`);
        return batch;
    }

    // Obtiene los lotes asociados a un producto
    async getBatchesByProduct(id_producto: number): Promise<Batch[]> {
        return await this.batchRepository.find({ where: { id_producto }, relations: ['supplier'], order: { fecha_vencimiento: 'ASC' } });
    }

    // Obtiene los lotes asociados a un proveedor
    async getBatchesBySupplier(id_proveedor: number): Promise<Batch[]> {
        return await this.batchRepository.find({ where: { id_proveedor }, relations: ['product'], order: { fecha_recepcion: 'DESC' } });
    }

    // Actualiza un lote y sincroniza el inventario si cambian cantidades o estados
    async updateBatch(id_lote: number, updateData: Partial<Batch>): Promise<Batch> {
        const updateResult = await this.batchRepository.update(id_lote, updateData);
        if (updateResult.affected === 0) throw new NotFoundException(`Lote ${id_lote} no encontrado`);
        
        const updatedBatch = await this.getBatchById(id_lote);
        
        if (updateData.cantidad_disponible !== undefined || updateData.estado_lote !== undefined) {
            await this.syncInventoryStock(updatedBatch.id_producto);
        }
        return updatedBatch;
    }

    // Elimina un lote y recalcula el inventario del producto
    async deleteBatch(id_lote: number): Promise<{ message: string }> {
        const batch = await this.getBatchById(id_lote); 
        const deleteResult = await this.batchRepository.delete(id_lote);
        
        if (deleteResult.affected === 0) throw new NotFoundException(`Lote ${id_lote} no encontrado`);
        
        await this.syncInventoryStock(batch.id_producto);
        
        return { message: `Lote ${id_lote} eliminado con éxito` };
    }

    // Calcula totales por estado, actualiza inventario y genera alertas
    private async syncInventoryStock(id_producto: number) {
        const activeSum = await this.batchRepository.sum('cantidad_disponible', { 
            id_producto: id_producto,
            estado_lote: 'activo'
        });
        const stockDisponible = activeSum || 0;

        const expiredSum = await this.batchRepository.sum('cantidad_disponible', { 
            id_producto: id_producto,
            estado_lote: 'vencido'
        });
        const stockVencido = expiredSum || 0;

        const damagedSum = await this.batchRepository.sum('cantidad_disponible', { 
            id_producto: id_producto,
            estado_lote: 'defectuoso'
        });
        const stockDanado = damagedSum || 0;

        let inventory = await this.inventoryService.getInventoryByProductId(id_producto).catch(() => null);

        if (!inventory) {
            inventory = await this.inventoryService.setInventory(id_producto, {
                stock_disponible: stockDisponible,
                stock_vencido: stockVencido,
                stock_danado: stockDanado,
                stock_reservado: 0,
                stock_minimo: 10 
            });
        } else {
            inventory.stock_disponible = stockDisponible;
            inventory.stock_vencido = stockVencido;
            inventory.stock_danado = stockDanado;
            inventory.ultima_actualizacion = new Date();
            await this.inventoryService.setInventory(id_producto, inventory);
        }

        if (inventory.stock_disponible <= inventory.stock_minimo) {
            const alerta = {
                id_producto: id_producto,
                tipo_alerta: 'Umbral mínimo',
                fecha_alerta: new Date(),
                mensaje: `El stock disponible (${stockDisponible}) ha bajado del mínimo permitido (${inventory.stock_minimo}).`,
            } as any;

            await this.stockAlertService.createAlert(alerta);
        }
    }

    // Determina que lotes usar para una venta priorizando fecha de vencimiento (FIFO)
    async getBatchesForSale(id_producto: number, cantidadRequerida: number): Promise<any[]> {
        const batches = await this.batchRepository.find({
            where: { 
                id_producto, 
                estado_lote: 'activo' 
            },
            order: { fecha_vencimiento: 'ASC' } 
        });

        const stockTotal = batches.reduce((sum, batch) => sum + batch.cantidad_disponible, 0);
        
        if (stockTotal < cantidadRequerida) {
            throw new BadRequestException(`Stock insuficiente para el producto ID ${id_producto}. Requerido: ${cantidadRequerida}, Disponible: ${stockTotal}`);
        }

        const asignacion: any[] = [];
        let faltaPorCubrir = cantidadRequerida;

        for (const batch of batches) {
            if (faltaPorCubrir <= 0) break;

            const tomar = Math.min(batch.cantidad_disponible, faltaPorCubrir);
            
            if (tomar > 0) {
                asignacion.push({
                    id_producto: batch.id_producto,
                    id_lote: batch.id_lote,
                    cantidad_a_usar: tomar,
                    precio_unitario: batch.costo_unitario
                });
                faltaPorCubrir -= tomar;
            }
        }

        return asignacion;
    }

    // Reduce el stock de un lote especifico dentro de una transaccion
    async reduceBatchStock(id_lote: number, cantidad: number, manager: EntityManager) {
        const batch = await manager.findOne(Batch, { where: { id_lote } });
        
        if (!batch) throw new NotFoundException(`Lote ${id_lote} no encontrado durante la transacción.`);

        batch.cantidad_disponible -= cantidad;

        if (batch.cantidad_disponible < 0) {
             throw new BadRequestException(`Error de concurrencia: El lote ${id_lote} no tiene suficiente stock.`);
        }

        await manager.save(batch);
    }
}