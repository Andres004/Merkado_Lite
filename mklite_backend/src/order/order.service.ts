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
    
    // Configuración de la tienda (UCB Cochabamba) y Tarifas
    private readonly STORE_LOCATION = { lat: -17.3713, lng: -66.1442 };
    private readonly BASE_RATE = 5.00;
    private readonly RATE_PER_KM = 2.00;

    constructor(
        private batchService: BatchService,
        private inventoryService: InventoryService,
    ) {}

    private getOrderRepository(): Repository<Order> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.orderRepository) this.orderRepository = AppDataSource.getRepository(Order);
        return this.orderRepository;
    }

    private escapePdfText(text: string): string {
        return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    }

    private buildInvoicePdf(lines: string[]): Buffer {
        const header = "%PDF-1.4\n";
        const objects: string[] = [];
        const offsets: number[] = [0];
        let currentOffset = header.length;

        const addObject = (id: number, body: string) => {
            offsets[id] = currentOffset;
            const serialized = `${id} 0 obj\n${body}\nendobj\n`;
            objects.push(serialized);
            currentOffset += serialized.length;
        };

        const contentLines = lines.map(this.escapePdfText);
        let contentStream = "BT\n/F1 12 Tf\n72 750 Td\n";
        contentLines.forEach((line) => {
            contentStream += `(${line}) Tj\n0 -18 Td\n`;
        });
        contentStream += "ET";

        const contentLength = Buffer.byteLength(contentStream, 'utf-8');

        addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
        addObject(2, "<< /Type /Pages /Count 1 /Kids [3 0 R] >>");
        addObject(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>");
        addObject(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        addObject(5, `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`);

        let pdf = header + objects.join('');

        const xrefOffset = pdf.length;
        let xref = `xref\n0 ${objects.length + 1}\n`;
        xref += "0000000000 65535 f \n";
        for (let i = 1; i <= objects.length; i++) {
            xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
        }

        const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

        pdf += xref + trailer;

        return Buffer.from(pdf, 'utf-8');
    }


    // --- NUEVO MÉTODO: Lógica de Haversine ---
    calculateShippingCost(userLat: number, userLng: number) {
        const R = 6371; // Radio de la tierra en km
        const dLat = (userLat - this.STORE_LOCATION.lat) * (Math.PI / 180);
        const dLng = (userLng - this.STORE_LOCATION.lng) * (Math.PI / 180);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.STORE_LOCATION.lat * (Math.PI / 180)) * Math.cos(userLat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        // Lógica de precio: Base + (Km extra * Tarifa)
        let cost = this.BASE_RATE;
        if (distanceKm > 1) {
            cost = this.BASE_RATE + ((distanceKm - 1) * this.RATE_PER_KM);
        }

        return {
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            cost: parseFloat(cost.toFixed(2))
        };
    }

    async createOrder(dto: CreateOrderDto): Promise<Order> {
        const queryRunner = AppDataSource.createQueryRunner(); 
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Obtener lotes disponibles (Sin cambios aquí)
            const itemsConLotePromises = dto.items.map(async (itemDto) => {
                const cantidadRequerida = Number(itemDto.cantidad);
                const idProducto = Number(itemDto.id_producto);
                if (cantidadRequerida <= 0) return [];

                const lotes = await this.batchService.getBatchesForSale(idProducto, cantidadRequerida);
                return lotes.map(lote => ({
                    ...lote,
                    precio_unitario: Number(itemDto.precio_unitario ?? lote.precio_unitario),
                }));
            });
            
            const itemsConLotes = await Promise.all(itemsConLotePromises);
            const itemsFlattened = itemsConLotes.flat(); 

            if (itemsFlattened.length === 0 && dto.items.length > 0) {
                 throw new BadRequestException("No se pudieron asignar productos (Stock insuficiente o error en lotes)");
            }

            // 2. Calcular Totales
            const subtotalCalculado = itemsFlattened.reduce((sum, item) => sum + (item.cantidad_a_usar * item.precio_unitario), 0);
            
            // --- CAMBIO: Determinación del Costo de Envío ---
            let costo_envio = 0;
            if (dto.tipo_entrega === 'domicilio') {
                // Si el frontend ya mandó el costo calculado, lo usamos.
                // Si no, y tenemos coordenadas, lo calculamos aquí como respaldo.
                if (dto.costo_envio !== undefined) {
                    costo_envio = Number(dto.costo_envio);
                } else if (dto.latitud_entrega && dto.longitud_entrega) {
                    const calculo = this.calculateShippingCost(Number(dto.latitud_entrega), Number(dto.longitud_entrega));
                    costo_envio = calculo.cost;
                } else {
                    costo_envio = 5.00; // Fallback tarifa base
                }
            }
            // ------------------------------------------------

            const subtotal = dto.subtotal_override ?? subtotalCalculado;
            const total = (dto.total_override ?? subtotal) + costo_envio;

            // 3. Crear el Pedido (Entidad Order)
            const newOrder = this.getOrderRepository().create({
                ...dto,
                estado: 'procesando',
                subtotal,
                costo_envio,
                total,
                // Guardamos coordenadas
                latitud_entrega: dto.latitud_entrega,
                longitud_entrega: dto.longitud_entrega,
                
                id_descuento_aplicado: dto.id_descuento_aplicado ?? undefined,
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date(),
            });

            const savedOrder = await queryRunner.manager.save(Order, newOrder);

            // 4, 5, 6, 7 (Resto del código igual: OrderItems, Stock, Shipment, Commit)
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
            console.error("Error creando pedido:", error);
            throw new BadRequestException(`Fallo en la creación del pedido: ${error.message}`); 
        } finally {
            await queryRunner.release();
        }
    }

    async generateInvoicePdf(id_pedido: number) {
        const order = await this.getOrderRepository().findOne({
            where: { id_pedido },
            relations: ['items', 'items.product', 'client'],
        });

        if (!order) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        if (order.metodo_pago?.toLowerCase() === 'efectivo') {
            throw new BadRequestException('La factura solo se emite para pagos electrónicos');
        }

        const itemLines = order.items?.map((item) => {
            const nombre = item.product?.nombre ?? 'Producto';
            const total = Number(item.precio_unitario ?? 0) * Number(item.cantidad ?? 0);
            return `${nombre} x${item.cantidad} - Bs. ${total.toFixed(2)}`;
        }) ?? [];

        const lines: string[] = [
            'Factura MERKADO LITE',
            `Pedido #${order.id_pedido}`,
            `Cliente: ${order.client?.nombre ?? ''} ${order.client?.apellido ?? ''}`.trim(),
            `Método de pago: ${order.metodo_pago}`,
            `Entrega: ${order.tipo_entrega}`,
            `Dirección: ${order.direccion_entrega}`,
            '--- Detalle ---',
            ...itemLines,
            `Subtotal: Bs. ${Number(order.subtotal).toFixed(2)}`,
            `Envío: Bs. ${Number(order.costo_envio).toFixed(2)}`,
            `Total: Bs. ${Number(order.total).toFixed(2)}`,
            'Este PDF es generado para factura de pago.',
        ];

        const buffer = this.buildInvoicePdf(lines);
        const filename = `factura-pedido-${order.id_pedido}.pdf`;
        return { buffer, filename, order };
    }

    async sendInvoiceEmail(id_pedido: number, correoDestino?: string) {
        const { buffer, filename, order } = await this.generateInvoicePdf(id_pedido);
        const destinatario = correoDestino || order.client?.email;
        if (!destinatario) {
            throw new BadRequestException('No se encontró un correo para el cliente');
        }

        // En entornos sin proveedor de correo, dejamos registro en consola.
        console.log(`Envío de factura a ${destinatario} para pedido ${id_pedido}`);

        return {
            message: 'Factura enviada al correo configurado',
            destinatario,
            adjunto: filename,
            base64: buffer.toString('base64'),
        };
    }


    // ... (El resto de métodos getOrderById, updateOrderState, etc., se mantienen igual)
    // Solo asegúrate de copiar el resto de tu clase original aquí abajo.
    async updateOrderState(id_pedido: number, nuevoEstado: string): Promise<Order> {
        const order = await this.getOrderRepository().findOneBy({ id_pedido });
        if (!order) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        order.estado = nuevoEstado;
        order.fecha_actualizacion = new Date();
        return this.getOrderRepository().save(order);
    }
    // ... incluir resto de métodos
     async getOrderById(id_pedido: number): Promise<Order> {
        const order = await this.getOrderRepository().findOne({
            where: { id_pedido },
            relations: ['items', 'items.product', 'shipment'] 
        });
        if (!order) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        return order;
    }

    async getOrdersByUser(userId: number, page: number = 1, limit: number = 10) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, limit);

        const qb = this.getOrderRepository()
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .where('order.id_usuario_cliente = :userId', { userId })
            .orderBy('order.fecha_creacion', 'DESC')
            .skip((safePage - 1) * safeLimit)
            .take(safeLimit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }

    async getOrderForUser(id_pedido: number, userId?: number, isAdmin: boolean = false): Promise<Order> {
        const qb = this.getOrderRepository()
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.shipment', 'shipment')
            .where('order.id_pedido = :id_pedido', { id_pedido });

        if (!isAdmin && userId) {
            qb.andWhere('order.id_usuario_cliente = :userId', { userId });
        }

        const order = await qb.getOne();
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