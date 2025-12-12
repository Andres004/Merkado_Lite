import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
//import { AppDataSource } from "src/data-source"; 
import { AppDataSource } from "src/data-source";
import { Repository } from "typeorm";
//import { Shipment } from "src/entity/shipment.entity"; 
import { Shipment } from "src/entity/shipment.entity";
import { OrderService } from "../order/order.service"; // Importar el servicio refactorizado

@Injectable()
export class ShipmentService {
    private shipmentRepository: Repository<Shipment>;

    constructor(
        private orderService: OrderService 
    ) {}

    private getRepository(): Repository<Shipment> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.shipmentRepository) this.shipmentRepository = AppDataSource.getRepository(Shipment);
        return this.shipmentRepository;
    }

    private normalizeState(value?: string) {
        return value?.toLowerCase();
    }

    // 1. Asignar Repartidor (Actualiza Envío y cambia estado del Pedido)
    async assignDriver(id_envio: number, id_repartidor: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        if (shipment.id_repartidor) throw new BadRequestException('El envío ya tiene un repartidor asignado');

        shipment.id_repartidor = id_repartidor;
        //shipment.estado_envio = 'En_camino';  esto borrado lo de abajo NUEVO
        //shipment.estado_envio = 'en_camino';
        //shipment.fecha_salida = new Date();
        shipment.estado_envio = 'asignado';
        shipment.fecha_salida = null;


        const updatedShipment = await this.getRepository().save(shipment);

        // Actualiza el estado del Pedido usando OrderService
        await this.orderService.updateOrderState(shipment.id_pedido, 'asignado');

        return updatedShipment;
    }

    async startRoute(id_envio: number, fecha_salida?: Date): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        if (!shipment.id_repartidor) throw new BadRequestException('El envío no tiene repartidor asignado');

        shipment.estado_envio = 'en_camino';
        shipment.fecha_salida = fecha_salida ?? shipment.fecha_salida ?? new Date();

        const updatedShipment = await this.getRepository().save(shipment);

        await this.orderService.updateOrderState(shipment.id_pedido, 'en_camino');

        return updatedShipment;
    }

    // 2. Marcar como Entregado
    async markAsDelivered(id_envio: number, calificacion?: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        //shipment.estado_envio = 'Entregado'; LO DE ABAJO NUEVO
        shipment.estado_envio = 'entregado';
        shipment.fecha_entrega = new Date();
        if (calificacion) shipment.calificacion_cliente = calificacion;

        const updatedShipment = await this.getRepository().save(shipment);

        // Actualiza el estado final del Pedido usando OrderService
        await this.orderService.updateOrderState(shipment.id_pedido, 'entregado');

        return updatedShipment;
    }

    async markAsFailed(id_envio: number, motivo: string, notas?: string): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        shipment.estado_envio = 'fallido';

        const updatedShipment = await this.getRepository().save(shipment);

        await this.orderService.updateOrderState(shipment.id_pedido, 'fallido');

        return updatedShipment;
    }


    // 3. Obtener envío por ID de Pedido (NUEVO - Para verificación)
    async getShipmentByOrderId(id_pedido: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_pedido });
        if (!shipment) throw new NotFoundException(`No se encontró envío asociado al pedido ${id_pedido}`);
        return shipment;
    }
    
    // 4. Obtener envío por ID de Envío (NUEVO - Útil en general)
    async getShipmentById(id_envio: number): Promise<Shipment> {
        //const shipment = await this.getRepository().findOneBy({ id_envio });
        const shipment = await this.getRepository().findOne({
            where: { id_envio },
            relations: ['order', 'order.items', 'order.items.product', 'order.client'],
        });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);
        return shipment; //shipment
    }

    async getShipmentsByDriver(id_repartidor: number, estado?: string): Promise<Shipment[]> {
        const qb = this.getRepository()
            .createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.order', 'order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.client', 'client')
            .where('shipment.id_repartidor = :id_repartidor', { id_repartidor });

        if (estado) {
            qb.andWhere('LOWER(shipment.estado_envio) = :estado', { estado: this.normalizeState(estado) });
        }

        qb.orderBy('shipment.fecha_salida', 'DESC').addOrderBy('shipment.fecha_entrega', 'DESC');

        return qb.getMany();
    }

    async getAvailableShipments(): Promise<Shipment[]> {
        return this.getRepository()
            .createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.order', 'order')
            .leftJoinAndSelect('order.client', 'client')
            .where('shipment.id_repartidor IS NULL')
            .andWhere('LOWER(shipment.estado_envio) = :estado', { estado: 'pendiente' })
            .orderBy('order.fecha_creacion', 'ASC')
            .getMany();
    }

    async getShipmentWithOrderDetail(id_envio: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOne({
            where: { id_envio },
            relations: ['order', 'order.items', 'order.items.product', 'order.client'],
        });

        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        return shipment;
    }
}