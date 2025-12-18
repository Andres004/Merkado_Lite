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

    // Obtener todo el inventario (para la tabla de admin)
    async getAllInventory(): Promise<Inventory[]> {
        return await this.inventoryRepository.find({
            relations: ['product'], 
            order: { id_producto: 'ASC' }
        });
    }

    // Obtener inventario de un producto específico
    async getInventoryByProductId(id_producto: number): Promise<Inventory> {
        const inventory = await this.inventoryRepository.findOne({
            where: { id_producto },
            relations: ['product']
        });
        
        if (!inventory) {
            throw new NotFoundException(`Inventario no encontrado para el producto ${id_producto}`);
        }
        return inventory;
    }

    // Crear o actualizar inventario base
    async setInventory(id_producto: number, data: Partial<Inventory>): Promise<Inventory> {
        const inventoryData = { ...data, id_producto };
        await this.inventoryRepository.save(inventoryData);
        return this.getInventoryByProductId(id_producto);
    }

    // Actualizar nivel de stock manualmente
    async updateStockLevel(id_producto: number, cantidad: number): Promise<Inventory> {
        const inventory = await this.getInventoryByProductId(id_producto);
        inventory.stock_disponible = Number(cantidad);
        inventory.ultima_actualizacion = new Date();
        return await this.inventoryRepository.save(inventory);
    }

    // --- MÉTODOS TRANSACCIONALES (USADOS POR PEDIDOS) ---

    async reduceStock(id_producto: number, cantidad: number, manager: EntityManager) {
        // Usamos el manager de la transacción para asegurar consistencia
        const inventory = await manager.findOne(Inventory, { where: { id_producto } });

        if (!inventory) {
            throw new NotFoundException(`Inventario para producto ${id_producto} no encontrado.`);
        }

        // Conversión explícita a número para evitar errores de texto
        const stockActual = Number(inventory.stock_disponible);
        const cantidadRestar = Number(cantidad);
        const nuevoStock = stockActual - cantidadRestar;

        if (nuevoStock < 0) {
             throw new Error(`Inconsistencia de inventario: El stock global no puede ser negativo (Actual: ${stockActual}, Requerido: ${cantidadRestar}).`);
        }

        inventory.stock_disponible = nuevoStock;
        inventory.ultima_actualizacion = new Date();

        await manager.save(inventory);
    }

    async increaseStock(id_producto: number, cantidad: number, manager: EntityManager) {
        const inventory = await manager.findOne(Inventory, { where: { id_producto } });

        if (!inventory) {
            throw new NotFoundException(`Inventario para producto ${id_producto} no encontrado.`);
        }

        // Conversión explícita a número
        inventory.stock_disponible = Number(inventory.stock_disponible) + Number(cantidad);
        inventory.ultima_actualizacion = new Date();

        await manager.save(inventory);
    }

    // --- REABASTECIMIENTO RÁPIDO (+100) ---
    async increaseStockBy100(id_producto: number): Promise<Inventory> {
        const inventory = await this.getInventoryByProductId(id_producto);
   
        inventory.stock_disponible = Number(inventory.stock_disponible) + 100;
        inventory.ultima_actualizacion = new Date();
        
        return await this.inventoryRepository.save(inventory);
    }
}