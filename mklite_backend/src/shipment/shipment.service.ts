import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
<<<<<<< HEAD
import { IsNull, Repository } from "typeorm";
=======
import { Repository } from "typeorm";
>>>>>>> Backend-andy
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

    // 1. Asignar Repartidor (Actualiza Envío y cambia estado del Pedido)
    async assignDriver(id_envio: number, id_repartidor: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        if (shipment.id_repartidor) throw new BadRequestException('El envío ya tiene un repartidor asignado');

        shipment.id_repartidor = id_repartidor;
        shipment.estado_envio = 'En_camino';
        shipment.fecha_salida = new Date();

        const updatedShipment = await this.getRepository().save(shipment);

        // Actualiza el estado del Pedido usando OrderService
        await this.orderService.updateOrderState(shipment.id_pedido, 'en_camino');

        return updatedShipment;
    }

    // 2. Marcar como Entregado
    async markAsDelivered(id_envio: number, calificacion?: number): Promise<Shipment> {
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        shipment.estado_envio = 'Entregado';
        shipment.fecha_entrega = new Date();
        if (calificacion) shipment.calificacion_cliente = calificacion;

        const updatedShipment = await this.getRepository().save(shipment);

        // Actualiza el estado final del Pedido usando OrderService
        await this.orderService.updateOrderState(shipment.id_pedido, 'entregado');

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
        const shipment = await this.getRepository().findOneBy({ id_envio });
        if (!shipment) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);
        return shipment; //shipment
    }
<<<<<<< HEAD

    // Actualizar estado de envio
    async updateShipmentStatus(id_envio: number, nuevoEstado: string): Promise<Shipment> {
        const estadosValidos = ['PROCESANDO', 'EN_CAMINO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO'];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new BadRequestException('Estado de envío no válido');
        }

        const shipment = await this.getShipmentById(id_envio);
        shipment.estado_envio = nuevoEstado;

        // Si el estado es 'ENTREGADO', establecer fecha_entrega
        if (nuevoEstado === 'ENTREGADO') {
            shipment.fecha_entrega = new Date();
        }

        // Si el estado es 'EN_CAMINO', establecer fecha_salida si no está establecida
        if (nuevoEstado === 'EN_CAMINO' && !shipment.fecha_salida) {
            shipment.fecha_salida = new Date();
        }

        return await this.getRepository().save(shipment);
    }

    // Manejar no aparición del cliente
    async handleNoShow(id_envio: number, id_usuario: number, userPenaltyService: any, userService: any): Promise<Shipment> {
        // 1. Actualizar el envío a estado CANCELADO
        const shipment = await this.updateShipmentStatus(id_envio, 'CANCELADO');

        // 2. Aplicar penalización al usuario
        const penalty = await userPenaltyService.createPenaltyForNoShow(id_usuario, id_envio);
        
        // 3. Bloquear usuario
        await userService.blockUser(id_usuario);

        return shipment;
    }

    // Obtener envíos por repartidor
    async getShipmentsByRepartidor(id_repartidor: number): Promise<Shipment[]> {
        return await this.getRepository().find({
            where: { id_repartidor },
            relations: ['sanciones'],
        });
    }

    // Obtener envíos por estado
    async getShipmentsByEstado(estado: string): Promise<Shipment[]> {
        const estadosValidos = ['PROCESANDO', 'EN_CAMINO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO'];
        if (!estadosValidos.includes(estado)) {
            throw new BadRequestException('Estado de envío no válido');
        }

        return await this.getRepository().find({
            where: { estado_envio: estado },
            relations: ['sanciones'],
        });
    }

    // Obtener envíos disponibles para repartidor (estado PROCESANDO)
    async getAvailableShipments(): Promise<Shipment[]> {
        return await this.getRepository().find({
            where: { 
                estado_envio: 'PROCESANDO',
                id_repartidor: IsNull()
            },
            relations: ['sanciones'],
        });
    }

    // Asignar repartidor a envío
    async assignRepartidor(id_envio: number, id_repartidor: number): Promise<Shipment> {
        const shipment = await this.getShipmentById(id_envio);
        
        if (shipment.estado_envio !== 'PROCESANDO') {
            throw new BadRequestException('Solo se pueden asignar repartidores a envíos en estado PROCESANDO');
        }

        shipment.id_repartidor = id_repartidor;
        return await this.getRepository().save(shipment);
    }

    // Calificar envío (HU-F23)
    async rateShipment(id_envio: number, calificacion: number): Promise<Shipment> {
        if (calificacion < 1 || calificacion > 5) {
            throw new BadRequestException('La calificación debe ser entre 1 y 5');
        }

        const shipment = await this.getShipmentById(id_envio);
        if (shipment.estado_envio !== 'ENTREGADO') {
            throw new BadRequestException('Solo se puede calificar un envío entregado');
        }

        shipment.calificacion_cliente = calificacion;
        return await this.getRepository().save(shipment);
    }

    // Registrar minutos de espera (para el flujo de no aparición)
    async registerWaitTime(id_envio: number, minutos_espera: number): Promise<Shipment> {
        const shipment = await this.getShipmentById(id_envio);
        shipment.minutos_espera = minutos_espera;
        return await this.getRepository().save(shipment);
    }
}
=======
}
>>>>>>> Backend-andy
