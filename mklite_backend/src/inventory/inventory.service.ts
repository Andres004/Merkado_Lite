import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { Inventory } from 'src/entity/inventory.entity'; 
import { AppDataSource } from 'src/data-source';

@Injectable()
export class InventoryService {
    private inventoryRepository: Repository<Inventory>;

    constructor() {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.inventoryRepository = AppDataSource.getRepository(Inventory);
    }

    // Obtiene el inventario de un producto específico
    async getInventoryByProductId(id_producto: number): Promise<Inventory> {
        const inventory = await this.inventoryRepository.findOneBy({ id_producto });
        if (!inventory) {
            throw new NotFoundException(`Inventario no encontrado para el producto ${id_producto}`);
        }
        return inventory;
    }

    // Crea o actualiza el inventario de un producto
    async setInventory(id_producto: number, data: Partial<Inventory>): Promise<Inventory> {
        const inventoryData = { ...data, id_producto };
        
        await this.inventoryRepository.save(inventoryData);
        
        return this.getInventoryByProductId(id_producto);
    }

    // Actualización rápida solo del stock disponible
    async updateStockLevel(id_producto: number, cantidad: number): Promise<Inventory> {
        const inventory = await this.getInventoryByProductId(id_producto);
        inventory.stock_disponible = cantidad;
        inventory.ultima_actualizacion = new Date();
        return await this.inventoryRepository.save(inventory);
    }

    // Reduce el stock disponible global dentro de una transaccion
    async reduceStock(id_producto: number, cantidad: number, manager: EntityManager) {
        const inventory = await manager.findOne(Inventory, { where: { id_producto } });

        if (!inventory) {
            throw new NotFoundException(`Inventario para producto ${id_producto} no encontrado.`);
        }

        inventory.stock_disponible -= cantidad;
        inventory.ultima_actualizacion = new Date();

        if (inventory.stock_disponible < 0) {
             throw new Error(`Inconsistencia de inventario: El stock global no puede ser negativo.`);
        }

        await manager.save(inventory);
    }
}