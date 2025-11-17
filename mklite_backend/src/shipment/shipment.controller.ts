import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ShipmentService } from './shipment.service';

// DTOs
class AssignDriverDto {
    id_repartidor: number;
}

class MarkDeliveredDto {
    calificacion_cliente?: number;
}

@Controller('shipment')
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) {}

    // Endpoint para asignar un repartidor 
    @Patch('/:id_envio/assign')
    async assignDriver(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: AssignDriverDto
    ) {
        return this.shipmentService.assignDriver(id_envio, dto.id_repartidor);
    }

    // Endpoint para marcar como entregado
    @Patch('/:id_envio/delivered')
    async markAsDelivered(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: MarkDeliveredDto
    ) {
        return this.shipmentService.markAsDelivered(id_envio, dto.calificacion_cliente);
    }
}