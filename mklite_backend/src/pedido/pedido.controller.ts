import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PedidoService } from './pedido.service';

// DTOs (Data Transfer Objects) definidos en el Controller
class ItemPedidoDto {
    id_producto: number;
    cantidad: number;
}

export class CreatePedidoDto { 
    id_usuario_cliente: number;
    tipo_pedido: string;
    metodo_pago: string;
    direccion_entrega: string;
    tipo_entrega: string;
    es_reserva?: boolean;
    fecha_hora_programada?: Date;
    id_descuento_aplicado?: number;

    items: ItemPedidoDto[]; 
}

export class UpdateEstadoPedidoDto {
    estado: string; 
}

@Controller('pedidos')
export class PedidoController {
    constructor(private readonly pedidoService: PedidoService) {}

    // 1. Crear un nuevo pedido
    @Post()
    async createPedido(@Body() dto: CreatePedidoDto) {
        return this.pedidoService.crearPedido(dto);
        
    }

    // 2. Obtener un pedido por ID
    @Get('/:id_pedido')
    async getPedido(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
        return this.pedidoService.getPedidoById(id_pedido);
    }

    // 3. Actualizar el estado de un pedido
    @Patch('/:id_pedido/estado')
    async updateEstado(
        @Param('id_pedido', ParseIntPipe) id_pedido: number,
        @Body() dto: UpdateEstadoPedidoDto
    ) {
        return this.pedidoService.updateEstadoPedido(id_pedido, dto.estado);
    }
}