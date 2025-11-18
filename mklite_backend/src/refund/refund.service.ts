import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Refund } from 'src/entity/refund.entity';
import { Order } from 'src/entity/order.entity';
import { InventoryService } from '../inventory/inventory.service'; // Inyectar para uso futuro

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  // Crear un nuevo reembolso
  async create(refundData: Partial<Refund>): Promise<Refund> {
    // 1. Validaciones
    if (!refundData.id_usuario_vendedor) throw new BadRequestException('ID Vendedor requerido');
    // Nota: Asumimos que refundData trae la propiedad 'pedido' o un id relacionado.
    // Si tu DTO envía 'id_pedido', asegúrate de mapearlo correctamente.
    const idPedido = refundData['id_pedido'] || (refundData.pedido ? refundData.pedido.id_pedido : null);
    
    if (!idPedido) throw new BadRequestException('ID Pedido requerido');

    const pedido = await this.orderRepository.findOneBy({ id_pedido: idPedido });
    if (!pedido) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);

    if (!refundData.monto_total || refundData.monto_total <= 0) {
      throw new BadRequestException('El monto total debe ser mayor a 0');
    }

    // 2. Crear Devolución
    const refund = this.refundRepository.create({
        ...refundData,
        pedido: pedido, // Asignar la relación
        fecha: new Date() // Asignar fecha actual
    });
    
    return await this.refundRepository.save(refund);
  }

  // Obtener todos los reembolsos
  async findAll(): Promise<Refund[]> {
    return await this.refundRepository.find({
      relations: ['pedido', 'vendedor'],
      order: { fecha: 'DESC' }
    });
  }

  // Obtener un reembolso por ID
  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: id },
      relations: ['pedido', 'vendedor', 'refundItems'] 
    });

    if (!refund) {
      throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    }

    return refund;
  }

  // Obtener reembolsos por ID de vendedor
  async findByVendedorId(idVendedor: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { id_usuario_vendedor: idVendedor },
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  // Obtener reembolsos por ID de pedido
  async findByPedidoId(idPedido: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { pedido: { id_pedido: idPedido } }, // Buscar por relación
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  // Actualizar reembolso
  async update(id: number, updateData: Partial<Refund>): Promise<Refund> {
    const refund = await this.findOne(id);
    
    const updatedRefund = await this.refundRepository.save({
      ...refund,
      ...updateData,
    });

    return updatedRefund;
  }

  // Eliminar un reembolso por ID
  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    }
  }

  // Devuelve los reembolsos en un rango de fechas
  async getRefundsByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: {
        fecha: Between(fechaInicio, fechaFin)
      },
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  // Obtener el total de reembolsos por ID de vendedor
  async getTotalRefundsByVendedor(idVendedor: number): Promise<number> {
    const result = await this.refundRepository
      .createQueryBuilder('refund')
      .select('SUM(refund.monto_total)', 'total')
      .where('refund.id_usuario_vendedor = :idVendedor', { idVendedor })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}