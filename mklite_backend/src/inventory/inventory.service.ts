import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Inventory } from 'src/entity/inventory.entity'; // Ajusta la ruta
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

    // Crea o actualiza el inventario de un producto.
    // Al ser relación 1:1 compartiendo ID, save funciona como Upsert.
    async setInventory(id_producto: number, data: Partial<Inventory>): Promise<Inventory> {
        // Aseguramos que el ID del objeto sea el del producto
        const inventoryData = { ...data, id_producto };
        
        // Guardamos (si existe actualiza, si no crea)
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
}