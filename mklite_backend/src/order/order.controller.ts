import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    Query,
    UseGuards,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
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
    
    // --- NUEVOS CAMPOS ---
    latitud_entrega?: number;
    longitud_entrega?: number;
    costo_envio?: number; // El frontend nos manda el costo calculado
    // ---------------------

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

// DTO para el endpoint de cálculo
export class CalculateShippingDto {
    userLat: number;
    userLng: number;
}

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // --- NUEVO ENDPOINT PARA CALCULAR ENVÍO ---
    @Post('calculate-shipping')
    calculateShipping(@Body() dto: CalculateShippingDto) {
        return this.orderService.calculateShippingCost(dto.userLat, dto.userLng);
    }
    // ------------------------------------------

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

    @UseGuards(AuthGuard('jwt'))
    @Get('/my')
    async getMyOrders(
        @Req() req: Request & { user?: any },
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        const userId = req.user?.id_usuario;
        if (!userId) throw new UnauthorizedException('Usuario no autenticado');

        return this.orderService.getOrdersByUser(userId, Number(page), Number(limit));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:id_pedido')
    async getOrder(
        @Param('id_pedido', ParseIntPipe) id_pedido: number,
        @Req() req: Request & { user?: any },
    ) {
        const userId = req.user?.id_usuario;
        const isAdmin = req.user?.userRoles?.some((ur) => ur.role?.nombre?.toUpperCase() === 'ADMIN');

        return this.orderService.getOrderForUser(id_pedido, userId, Boolean(isAdmin));
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