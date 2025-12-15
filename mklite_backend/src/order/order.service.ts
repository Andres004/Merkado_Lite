import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm"; 
import { Order } from "src/entity/order.entity";
import { OrderItem } from "src/entity/orderitem.entity";
import { Shipment } from "src/entity/shipment.entity";
import { CreateOrderDto } from "./order.controller"; 

import { BatchService } from '../batch/batch.service'; 
import { InventoryService } from '../inventory/inventory.service'; 

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
            const itemsConLotePromises = dto.items.map(async (itemDto) => {
                const lotes = await this.batchService.getBatchesForSale(itemDto.id_producto, itemDto.cantidad);
                return lotes.map(lote => ({
                    ...lote,
                    precio_unitario: itemDto.precio_unitario ?? lote.precio_unitario,
                }));
            });

            const itemsConLotes = await Promise.all(itemsConLotePromises);
            const itemsFlattened = itemsConLotes.flat();

            const subtotalCalculado = itemsFlattened.reduce((sum, item) => sum + (item.cantidad_a_usar * item.precio_unitario), 0);
            const costo_envio = dto.tipo_entrega === 'domicilio' ? 5.00 : 0.00;
            const subtotal = dto.subtotal_override ?? subtotalCalculado;
            const totalCalculado = subtotal + costo_envio;
            const total = dto.total_override ?? totalCalculado;
            
            const newOrder = this.getOrderRepository().create({
                ...dto,
                estado: 'procesando',
                subtotal,
                costo_envio,
                total,
                id_descuento_aplicado: dto.id_descuento_aplicado ?? undefined, //null
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date(),
            });

            const savedOrder = await queryRunner.manager.save(Order, newOrder);

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

            for (const item of itemsFlattened) {
                await this.inventoryService.reduceStock(item.id_producto, item.cantidad_a_usar, queryRunner.manager);
                await this.batchService.reduceBatchStock(item.id_lote, item.cantidad_a_usar, queryRunner.manager);
            }

            const newShipment = new Shipment();
            newShipment.id_pedido = savedOrder.id_pedido;
            newShipment.estado_envio = 'Pendiente'; 
            
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

    
    async getAllOrders(estado?: string, fecha?: string): Promise<Order[]> {
        const qb = this.getOrderRepository()
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.client', 'client')
            .leftJoinAndSelect('order.shipment', 'shipment')
            .orderBy('order.fecha_creacion', 'DESC');

        if (estado) {
            qb.where('LOWER(order.estado) = :estado', { estado: estado.toLowerCase() });
        }

        if (fecha) {
            const parsedDate = new Date(fecha);
            if (!isNaN(parsedDate.getTime())) {
                qb.andWhere('DATE(order.fecha_creacion) = :fecha', {
                    fecha: parsedDate.toISOString().slice(0, 10),
                });
            }
        }

        return qb.getMany();
    }

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
}