import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { OrderService } from './order.service';

export class ItemOrderDto {
    id_producto: number;
    cantidad: number;
    precio_unitario?: number;
}

export class CreateOrderDto { 
    id_usuario_cliente: number;
    tipo_pedido: string;
    metodo_pago: string;
    direccion_entrega: string;
    tipo_entrega: string;
    es_reserva?: boolean;
    fecha_hora_programada?: Date;
    id_descuento_aplicado?: number;
    subtotal_override?: number;
    total_override?: number;

    items: ItemOrderDto[]; 
}

export class UpdateOrderStateDto {
    estado: string; 
}

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    async createOrder(@Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(dto);
    }

    @Get()
    async getAllOrders(
        @Query('estado') estado?: string,
        @Query('fecha') fecha?: string,
    ) {
        return this.orderService.getAllOrders(estado, fecha);
    }

    @Get('/:id_pedido')
    async getOrder(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
        return this.orderService.getOrderById(id_pedido);
    }

    @Patch('/:id_pedido/estado')
    async updateState(
        @Param('id_pedido', ParseIntPipe) id_pedido: number,
        @Body() dto: UpdateOrderStateDto
    ) {
        return this.orderService.updateOrderState(id_pedido, dto.estado);
    }

    @Patch('/:id_pedido/cancel')
    async cancelOrder(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
        return this.orderService.cancelOrder(id_pedido);
    }
}