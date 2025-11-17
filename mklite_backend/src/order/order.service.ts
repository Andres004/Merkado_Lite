import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository, DataSource } from "typeorm";
import { Order } from "src/entity/order.entity";
import { OrderItem } from "src/entity/orderitem.entity"; // <--- Import correcto
import { CreateOrderDto } from "./order.controller"; 

// Importaciones de Módulos externos
import { BatchService } from '../batch/batch.service'; 
import { InventoryService } from '../inventory/inventory.service'; 

@Injectable()
export class OrderService {
    private orderRepository: Repository<Order>;

    constructor(
        private batchService: BatchService,
        private inventoryService: InventoryService,
        private dataSource: DataSource,
    ) {}

    private getOrderRepository(): Repository<Order> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.orderRepository) this.orderRepository = AppDataSource.getRepository(Order);
        return this.orderRepository;
    }

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Lógica de Lotes (Batch)
            const itemsConLotePromises = dto.items.map(async (itemDto) => {
                return await this.batchService.getBatchesForSale(itemDto.id_producto, itemDto.cantidad);
            });
            
            const itemsConLotes = await Promise.all(itemsConLotePromises);
            const itemsFlattened = itemsConLotes.flat(); 

            // 2. Cálculo de Totales
            const subtotal = itemsFlattened.reduce((sum, item) => sum + (item.cantidad_a_usar * item.precio_unitario), 0);
            const costo_envio = dto.tipo_entrega === 'domicilio' ? 5.00 : 0.00; 
            const total = subtotal + costo_envio;

            // 3. Crear Objeto Order
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

            // 4. Guardar OrderItems (Detalles)
            // Mapeamos los items a la entidad OrderItem
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

            // 5. Actualizar Inventario y Lotes
            for (const item of itemsFlattened) {
                await this.inventoryService.reduceStock(item.id_producto, item.cantidad_a_usar, queryRunner.manager);
                await this.batchService.reduceBatchStock(item.id_lote, item.cantidad_a_usar, queryRunner.manager);
            }

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
}