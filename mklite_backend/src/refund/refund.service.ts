import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { Refund } from 'src/entity/refund.entity';
import { Order } from 'src/entity/order.entity';
import { InventoryService } from '../inventory/inventory.service';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class RefundService {
  private refundRepository: Repository<Refund>;
  private orderRepository: Repository<Order>;

  constructor(
    private inventoryService: InventoryService,
  ) {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.refundRepository = AppDataSource.getRepository(Refund);
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  async create(refundData: Partial<Refund>): Promise<Refund> {
    if (!refundData.id_usuario_vendedor) throw new BadRequestException('ID Vendedor requerido');
    
    const idPedido = refundData['id_pedido'] || (refundData.pedido ? refundData.pedido.id_pedido : null);
    
    if (!idPedido) throw new BadRequestException('ID Pedido requerido');

    const pedido = await this.orderRepository.findOneBy({ id_pedido: idPedido });
    if (!pedido) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);

    if (!refundData.monto_total || refundData.monto_total <= 0) {
      throw new BadRequestException('El monto total debe ser mayor a 0');
    }

    const refund = this.refundRepository.create({
        ...refundData,
        pedido: pedido,
        fecha: new Date()
    });
    
    return await this.refundRepository.save(refund);
  }

  async findAll(): Promise<Refund[]> {
    return await this.refundRepository.find({
      relations: ['pedido', 'vendedor'],
      order: { fecha: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: id },
      relations: ['pedido', 'vendedor', 'refundItems'] 
    });

    if (!refund) throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    return refund;
  }

  async findByVendedorId(idVendedor: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { id_usuario_vendedor: idVendedor },
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  async findByPedidoId(idPedido: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { pedido: { id_pedido: idPedido } },
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  async update(id: number, updateData: Partial<Refund>): Promise<Refund> {
    const refund = await this.findOne(id);
    const updatedRefund = await this.refundRepository.save({ ...refund, ...updateData });
    return updatedRefund;
  }

  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
  }

  async getRefundsByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { fecha: Between(fechaInicio, fechaFin) },
      relations: ['pedido'],
      order: { fecha: 'DESC' }
    });
  }

  async getTotalRefundsByVendedor(idVendedor: number): Promise<number> {
    const result = await this.refundRepository
      .createQueryBuilder('refund')
      .select('SUM(refund.monto_total)', 'total')
      .where('refund.id_usuario_vendedor = :idVendedor', { idVendedor })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}