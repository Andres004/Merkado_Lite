//import { Controller, Patch, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
//import { ShipmentService } from './shipment.service';
import { Controller, Patch, Get, Param, Body, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

// DTOs
class AssignDriverDto {
    id_repartidor: number;
}

class MarkDeliveredDto {
    calificacion_cliente?: number;
}

class StartRouteDto {
    fecha_salida?: Date;
}

class FailShipmentDto {
    motivo: string;
    notas?: string;
}

@Controller('shipment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) {}

    // Endpoint para asignar un repartidor 
    @Patch('/:id_envio/assign')
    @Roles('ADMIN', 'REPARTIDOR')
    async assignDriver(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: AssignDriverDto
    ) {
        return this.shipmentService.assignDriver(id_envio, dto.id_repartidor);
    }

    // Endpoint para marcar como entregado
    @Patch('/:id_envio/delivered')
    @Roles('ADMIN', 'REPARTIDOR')
    async markAsDelivered(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: MarkDeliveredDto
    ) {
        return this.shipmentService.markAsDelivered(id_envio, dto.calificacion_cliente);
    }

    @Patch('/:id_envio/start')
    @Roles('ADMIN', 'REPARTIDOR')
    async startRoute(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: StartRouteDto,
    ) {
        return this.shipmentService.startRoute(id_envio, dto.fecha_salida);
    }

    @Patch('/:id_envio/fail')
    @Roles('ADMIN', 'REPARTIDOR')
    async markAsFailed(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: FailShipmentDto,
    ) {
        return this.shipmentService.markAsFailed(id_envio, dto.motivo, dto.notas);
    }


    @Get('/driver/:id_repartidor')
    @Roles('ADMIN', 'REPARTIDOR')
    async getShipmentsByDriver(
        @Param('id_repartidor', ParseIntPipe) id_repartidor: number,
        @Query('estado') estado?: string
    ) {
        return this.shipmentService.getShipmentsByDriver(id_repartidor, estado);
    }

    @Get('/driver/:id_repartidor/history/list')
    @Roles('ADMIN', 'REPARTIDOR')
    async getDriverHistory(
       // @Param('id_repartidor', ParseIntPipe) id_repartidor: number
        @Param('id_repartidor', ParseIntPipe) id_repartidor: number,
        @Query('estado') estado?: string,
    ) {
        //return this.shipmentService.getShipmentsByDriver(id_repartidor, 'entregado');
        return this.shipmentService.getShipmentsByDriver(id_repartidor, estado ?? 'entregado');
    }

    @Get('/available/list')
    @Roles('ADMIN', 'REPARTIDOR')
    async getAvailable() {
        return this.shipmentService.getAvailableShipments();
    }

    @Get('/:id_envio/detail/full')
    @Roles('ADMIN', 'REPARTIDOR')
    async getShipmentDetail(@Param('id_envio', ParseIntPipe) id_envio: number) {
        return this.shipmentService.getShipmentWithOrderDetail(id_envio);
    }

    // Obtener envío por ID de Pedido (Verificación automática)
    @Get('/order/:id_pedido')
    @Roles('ADMIN', 'REPARTIDOR')
    async getShipmentByOrder(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
        return this.shipmentService.getShipmentByOrderId(id_pedido);
    }

    // Obtener envío por ID de Envío
    @Get('/:id_envio')
    @Roles('ADMIN', 'REPARTIDOR')
    async getShipment(@Param('id_envio', ParseIntPipe) id_envio: number) {
        return this.shipmentService.getShipmentById(id_envio);
    }
}