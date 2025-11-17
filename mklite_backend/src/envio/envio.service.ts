import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository } from "typeorm";
import { Envio } from "src/entity/envio.entity"; 
import { PedidoService } from "src/pedido/pedido.service"; 

@Injectable()
export class EnvioService {
    private envioRepository: Repository<Envio>;

    constructor(
        private pedidoService: PedidoService 
    ) {}

    private getRepository(): Repository<Envio> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.envioRepository) this.envioRepository = AppDataSource.getRepository(Envio);
        return this.envioRepository;
    }

    // 1. Asignar Repartidor (Actualiza Envío y cambia estado del Pedido)
    async assignRepartidor(id_envio: number, id_repartidor: number): Promise<Envio> {
        const envio = await this.getRepository().findOneBy({ id_envio });
        if (!envio) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        if (envio.id_repartidor) throw new BadRequestException('El envío ya tiene un repartidor asignado');

        envio.id_repartidor = id_repartidor;
        envio.estado_envio = 'En_camino';
        envio.fecha_salida = new Date();

        const updatedEnvio = await this.getRepository().save(envio);

        // Actualiza el estado del Pedido
        await this.pedidoService.updateEstadoPedido(envio.id_pedido, 'en_camino');

        return updatedEnvio;
    }

    // 2. Marcar como Entregado
    async marcarEntregado(id_envio: number, calificacion?: number): Promise<Envio> {
        const envio = await this.getRepository().findOneBy({ id_envio });
        if (!envio) throw new NotFoundException(`Envío ID ${id_envio} no encontrado`);

        envio.estado_envio = 'Entregado';
        envio.fecha_entrega = new Date();
        if (calificacion) envio.calificacion_cliente = calificacion;

        const updatedEnvio = await this.getRepository().save(envio);

        // Actualiza el estado final del Pedido
        await this.pedidoService.updateEstadoPedido(envio.id_pedido, 'entregado');

        return updatedEnvio;
    }
}