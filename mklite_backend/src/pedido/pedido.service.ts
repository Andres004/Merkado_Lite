import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { Repository, DataSource } from "typeorm";
import { Pedido } from "src/entity/pedido.entity";
import { PedidoItem } from "src/entity/pedido_item.entity";
// ASUMIDO: Importación de servicios de stock
import { LoteService } from '../lote/lote.service'; 
import { InventarioService } from '../inventario/inventario.service'; 
import { CreatePedidoDto } from "./pedido.controller"; 

@Injectable()
export class PedidoService {
    private pedidoRepository: Repository<Pedido>;
    private pedidoItemRepository: Repository<PedidoItem>;

    constructor(
        // Inyección de servicios de stock
        private loteService: LoteService,
        private inventarioService: InventarioService,
        private dataSource: DataSource,
    ) {}

    private getPedidoRepository(): Repository<Pedido> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.pedidoRepository) this.pedidoRepository = AppDataSource.getRepository(Pedido);
        return this.pedidoRepository;
    }

    // =================================================================
    // FUNCIÓN CLAVE: CREACIÓN DE PEDIDO CON TRANSACCIÓN (Manejo de Lotes/Stock)
    // =================================================================
    async crearPedido(dto: CreatePedidoDto): Promise<Pedido> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Asignar Lotes y validar stock (Lógica delegada)
            const itemsConLotePromises = dto.items.map(async (itemDto) => {
                const lotesAsignados = await this.loteService.asignarLotesParaVenta(itemDto.id_producto, itemDto.cantidad);
                return lotesAsignados;
            });
            
            const itemsConLotes = await Promise.all(itemsConLotePromises);
            const itemsFlattened = itemsConLotes.flat(); 

            // 2. Cálculo de Totales y Creación del Pedido
            const subtotal = itemsFlattened.reduce((sum, item) => sum + (item.cantidad_a_usar * item.precio_unitario_venta), 0);
            const costo_envio = dto.tipo_entrega === 'domicilio' ? 5.00 : 0.00; 
            const total = subtotal + costo_envio;

            const nuevoPedido = this.getPedidoRepository().create({
                ...dto,
                estado: 'procesando',
                subtotal,
                costo_envio,
                total,
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date(),
            });

            const pedidoGuardado = await queryRunner.manager.save(Pedido, nuevoPedido);

            // 3. Guardar PedidoItems (Detalles)
            const itemsParaGuardar = itemsFlattened.map(item => ({
                id_pedido: pedidoGuardado.id_pedido,
                id_producto: item.id_producto,
                id_lote: item.id_lote,
                cantidad: item.cantidad_a_usar,
                precio_unitario: item.precio_unitario_venta,
            }));
            
            await queryRunner.manager.save(PedidoItem, itemsParaGuardar);

            // 4. Actualizar Inventario y Lotes (Disminuir stock en la BD)
            for (const item of itemsFlattened) {
                await this.inventarioService.disminuirStock(item.id_producto, item.cantidad_a_usar, queryRunner.manager);
                await this.loteService.actualizarStockLote(item.id_lote, item.cantidad_a_usar, queryRunner.manager);
            }

            await queryRunner.commitTransaction();
            return pedidoGuardado;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(`Fallo en la creación del pedido: ${error.message}`); 
        } finally {
            await queryRunner.release();
        }
    }

    // Métodos de soporte para EnvioService y lectura
    async updateEstadoPedido(id_pedido: number, nuevoEstado: string): Promise<Pedido> {
        const pedido = await this.getPedidoRepository().findOneBy({ id_pedido });
        if (!pedido) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        
        pedido.estado = nuevoEstado;
        pedido.fecha_actualizacion = new Date();
        
        return this.getPedidoRepository().save(pedido);
    }

    async getPedidoById(id_pedido: number): Promise<Pedido> {
        const pedido = await this.getPedidoRepository().findOne({
            where: { id_pedido },
            relations: ['items'] 
        });
        if (!pedido) throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
        return pedido;
    }
}