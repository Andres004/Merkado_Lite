import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm"; 
import { Order } from "src/entity/order.entity";
import { OrderItem } from "src/entity/orderitem.entity";
<<<<<<< HEAD
import { Shipment } from "src/entity/shipment.entity"; // <--- 1. NUEVO IMPORT
import { CreateOrderDto } from "./order.controller"; 

import { BatchService } from '../batch/batch.service'; 
import { InventoryService } from '../inventory/inventory.service';
=======
import { Shipment } from "src/entity/shipment.entity";
import { CreateOrderDto } from "./order.controller"; 

import { BatchService } from '../batch/batch.service'; 
import { InventoryService } from '../inventory/inventory.service'; 
>>>>>>> Backend-andy

@Injectable()
export class OrderService {
    private orderRepository: Repository<Order>;

    constructor(
        private batchService: BatchService,
        private inventoryService: InventoryService,
    ) {}

    private getOrderRepository(): Repository<Order> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.orderRepository) this.orderRepository = AppDataSource.getRepository(Order);
        return this.orderRepository;
    }

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const queryRunner = AppDataSource.createQueryRunner(); 
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
<<<<<<< HEAD
            // 1. Lógica de Lotes (FIFO)
=======
>>>>>>> Backend-andy
            const itemsConLotePromises = dto.items.map(async (itemDto) => {
                return await this.batchService.getBatchesForSale(itemDto.id_producto, itemDto.cantidad);
            });
            
            const itemsConLotes = await Promise.all(itemsConLotePromises);
            const itemsFlattened = itemsConLotes.flat(); 

<<<<<<< HEAD
            // 2. Cálculo de Totales
=======
>>>>>>> Backend-andy
            const subtotal = itemsFlattened.reduce((sum, item) => sum + (item.cantidad_a_usar * item.precio_unitario), 0);
            const costo_envio = dto.tipo_entrega === 'domicilio' ? 5.00 : 0.00; 
            const total = subtotal + costo_envio;

<<<<<<< HEAD
            // 3. Crear Objeto Order
=======
>>>>>>> Backend-andy
            const newOrder = this.getOrderRepository().create({
                ...dto,
                estado: 'procesando',
                subtotal,
                costo_envio,
                total,
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date(),
            });

            const savedOrder = await queryRunner.manager.save(Order, newOrder);

<<<<<<< HEAD
            // 4. Guardar OrderItems
=======
>>>>>>> Backend-andy
            const itemsToSave = itemsFlattened.map(item => {
                const orderItem = new OrderItem();
                orderItem.id_pedido = savedOrder.id_pedido;
                orderItem.id_producto = item.id_producto;
                orderItem.id_lote = item.id_lote;
                orderItem.cantidad = item.cantidad_a_usar;
                orderItem.precio_unitario = item.precio_unitario;
                return orderItem;
            });
            
            await queryRunner.manager.save(OrderItem, itemsToSave);

<<<<<<< HEAD
            // 5. Actualizar Inventario y Lotes
=======
>>>>>>> Backend-andy
            for (const item of itemsFlattened) {
                await this.inventoryService.reduceStock(item.id_producto, item.cantidad_a_usar, queryRunner.manager);
                await this.batchService.reduceBatchStock(item.id_lote, item.cantidad_a_usar, queryRunner.manager);
            }

<<<<<<< HEAD
            // 6. CREAR AUTOMÁTICAMENTE EL ENVÍO (NUEVO PASO)
            // Esto cumple el flujo: Pedido -> Se genera logística pendiente
            const newShipment = new Shipment();
            newShipment.id_pedido = savedOrder.id_pedido;
            newShipment.estado_envio = 'Pendiente'; // Estado inicial para que el repartidor lo tome luego
            // newShipment.sector = ... (Aquí podrías implementar lógica de sectores si tuvieras el dato)
=======
            const newShipment = new Shipment();
            newShipment.id_pedido = savedOrder.id_pedido;
            newShipment.estado_envio = 'Pendiente'; 
>>>>>>> Backend-andy
            
            await queryRunner.manager.save(Shipment, newShipment);

            await queryRunner.commitTransaction();
            return savedOrder;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(`Fallo en la creación del pedido: ${error.message}`); 
        } finally {
            await queryRunner.release();
        }
    }

    async updateOrderState(id_pedido: number, nuevoEstado: string): Promise<Order> {
        const order = await this.getOrderRepository().findOneBy({ id_pedido });
        if (!order) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        
        order.estado = nuevoEstado;
        order.fecha_actualizacion = new Date();
        
        return this.getOrderRepository().save(order);
    }

    async getOrderById(id_pedido: number): Promise<Order> {
        const order = await this.getOrderRepository().findOne({
            where: { id_pedido },
            relations: ['items', 'items.product'] 
        });
        if (!order) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        return order;
    }
<<<<<<< HEAD
=======

    async cancelOrder(id_pedido: number): Promise<Order> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager.findOne(Order, {
                where: { id_pedido },
                relations: ['items']
            });

            if (!order) throw new NotFoundException(`Pedido ${id_pedido} no encontrado.`);

            if (order.estado === 'anulado') throw new BadRequestException('El pedido ya está anulado.');
            if (order.estado === 'entregado') throw new BadRequestException('No se puede anular un pedido ya entregado.');

            for (const item of order.items) {
                await this.inventoryService.increaseStock(item.id_producto, item.cantidad, queryRunner.manager);
                await this.batchService.restoreBatchStock(item.id_lote, item.cantidad, queryRunner.manager);
            }

            order.estado = 'anulado';
            order.fecha_actualizacion = new Date();
            await queryRunner.manager.save(order);

            const shipment = await queryRunner.manager.findOne(Shipment, { where: { id_pedido } });
            if (shipment) {
                shipment.estado_envio = 'Cancelado';
                await queryRunner.manager.save(shipment);
            }

            await queryRunner.commitTransaction();
            return order;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
>>>>>>> Backend-andy
}