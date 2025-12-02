import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
<<<<<<< HEAD
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Refund } from 'src/entity/refund.entity';
import { Order } from 'src/entity/order.entity';
import { InventoryService } from '../inventory/inventory.service'; // Inyectar para uso futuro
=======
import { Repository, Between } from 'typeorm';
import { Refund } from 'src/entity/refund.entity';
import { Order } from 'src/entity/order.entity';
import { InventoryService } from '../inventory/inventory.service';
import { AppDataSource } from 'src/data-source';
>>>>>>> Backend-andy

@Injectable()
export class RefundService {
  private refundRepository: Repository<Refund>;
  private orderRepository: Repository<Order>;

  constructor(
<<<<<<< HEAD
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
=======
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
    
    // Nota: El frontend puede enviar 'id_pedido' o el objeto 'order'
    const idPedido = refundData['id_pedido'] || (refundData.order ? refundData.order.id_pedido : null);
>>>>>>> Backend-andy
    
    if (!idPedido) throw new BadRequestException('ID Pedido requerido');

    const pedido = await this.orderRepository.findOneBy({ id_pedido: idPedido });
    if (!pedido) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);

    if (!refundData.monto_total || refundData.monto_total <= 0) {
      throw new BadRequestException('El monto total debe ser mayor a 0');
    }

<<<<<<< HEAD
    // 2. Crear Devolución
    const refund = this.refundRepository.create({
        ...refundData,
        pedido: pedido, // Asignar la relación
        fecha: new Date() // Asignar fecha actual
=======
    const refund = this.refundRepository.create({
        ...refundData,
        order: pedido, // CAMBIO: .pedido -> .order
        fecha: new Date()
>>>>>>> Backend-andy
    });
    
    return await this.refundRepository.save(refund);
  }

  async findAll(): Promise<Refund[]> {
    return await this.refundRepository.find({
<<<<<<< HEAD
      relations: ['pedido', 'vendedor'],
=======
      relations: ['order', 'seller'], // CAMBIO: .pedido -> .order, .vendedor -> .seller
>>>>>>> Backend-andy
      order: { fecha: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: id },
<<<<<<< HEAD
      relations: ['pedido', 'vendedor', 'refundItems'] 
=======
      relations: ['order', 'seller', 'refundItems'] // CAMBIO: .pedido -> .order
>>>>>>> Backend-andy
    });

    if (!refund) throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
    return refund;
  }

<<<<<<< HEAD
  // Obtener reembolsos por ID de vendedor
  async findByVendedorId(idVendedor: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { id_usuario_vendedor: idVendedor },
      relations: ['pedido'],
=======
  async findByVendedorId(idVendedor: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { id_usuario_vendedor: idVendedor },
      relations: ['order'], // CAMBIO: .pedido -> .order
>>>>>>> Backend-andy
      order: { fecha: 'DESC' }
    });
  }

<<<<<<< HEAD
  // Obtener reembolsos por ID de pedido
  async findByPedidoId(idPedido: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { pedido: { id_pedido: idPedido } }, // Buscar por relación
      relations: ['pedido'],
=======
  async findByPedidoId(idPedido: number): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { order: { id_pedido: idPedido } }, // CAMBIO: .pedido -> .order
      relations: ['order'], // CAMBIO: .pedido -> .order
>>>>>>> Backend-andy
      order: { fecha: 'DESC' }
    });
  }

  // Actualizar reembolso
  async update(id: number, updateData: Partial<Refund>): Promise<Refund> {
    const refund = await this.findOne(id);
<<<<<<< HEAD
    
    const updatedRefund = await this.refundRepository.save({
      ...refund,
      ...updateData,
    });

=======
    const updatedRefund = await this.refundRepository.save({ ...refund, ...updateData });
>>>>>>> Backend-andy
    return updatedRefund;
  }

  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Reembolso con ID ${id} no encontrado`);
  }

<<<<<<< HEAD
  // Devuelve los reembolsos en un rango de fechas
  async getRefundsByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: {
        fecha: Between(fechaInicio, fechaFin)
      },
      relations: ['pedido'],
=======
  async getRefundsByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Refund[]> {
    return await this.refundRepository.find({
      where: { fecha: Between(fechaInicio, fechaFin) },
      relations: ['order'], // CAMBIO: .pedido -> .order
>>>>>>> Backend-andy
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