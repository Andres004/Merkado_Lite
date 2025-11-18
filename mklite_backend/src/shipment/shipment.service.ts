import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm";
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
}
