import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { EnvioService } from './envio.service';

// DTOs definidos en el Controller
class AssignRepartidorDto {
    id_repartidor: number;
}

class MarcarEntregadoDto {
    calificacion_cliente?: number;
}

@Controller('envios')
export class EnvioController {
    constructor(private readonly envioService: EnvioService) {}

    // Endpoint para asignar un repartidor 
    @Patch('/:id_envio/asignar')
    async assignRepartidor(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: AssignRepartidorDto
    ) {
        return this.envioService.assignRepartidor(id_envio, dto.id_repartidor);
    }

    // Endpoint para marcar como entregado
    @Patch('/:id_envio/entregado')
    async marcarEntregado(
        @Param('id_envio', ParseIntPipe) id_envio: number,
        @Body() dto: MarcarEntregadoDto
    ) {
        return this.envioService.marcarEntregado(id_envio, dto.calificacion_cliente);
    }
}