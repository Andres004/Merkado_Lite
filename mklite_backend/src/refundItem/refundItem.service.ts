import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundItem } from '../entity/refundItem.entity';
import { Refund } from 'src/entity/refund.entity';
import { Product } from 'src/entity/product.entity';

@Injectable()
export class RefundItemService {
  constructor(
    @InjectRepository(RefundItem)
    private refundItemRepository: Repository<RefundItem>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Crear un nuevo item de devolución
  async create(refundItemData: Partial<RefundItem>): Promise<RefundItem> {
    // Validar que la devolución existe
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: refundItemData.id_devolucion }
    });

    if (!refund) {
      throw new NotFoundException(`Devolución con ID ${refundItemData.id_devolucion} no encontrada`);
    }

    // Validar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id_producto: refundItemData.id_producto }
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${refundItemData.id_producto} no encontrado`);
    }

    // Validar que no existe ya este item para esta devolución
    const existingItem = await this.refundItemRepository.findOne({
      where: {
        id_devolucion: refundItemData.id_devolucion,
        id_producto: refundItemData.id_producto
      }
    });

    if (existingItem) {
      throw new BadRequestException('Este producto ya está registrado en la devolución');
    }

    const refundItem = this.refundItemRepository.create(refundItemData);
    return await this.refundItemRepository.save(refundItem);
  }

  // Obtener todos los items de devolución
  async findAll(): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      relations: ['refund', 'product']
    });
  }

  // Obtener item de devolución por ID de devolución
  async findByRefundId(idDevolucion: number): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      where: { id_devolucion: idDevolucion },
      relations: ['refund', 'product']
    });
  }

  // Obtener item de devolución por ID de producto
  async findByProductId(idProducto: number): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      where: { id_producto: idProducto },
      relations: ['refund', 'product']
    });
  }

  // Obtener un item de devolución por ID de devolución y ID de producto
  async findOne(idDevolucion: number, idProducto: number): Promise<RefundItem> {
    const refundItem = await this.refundItemRepository.findOne({
      where: { 
        id_devolucion: idDevolucion,
        id_producto: idProducto 
      },
      relations: ['refund', 'product']
    });

    if (!refundItem) {
      throw new NotFoundException(
        `Item de devolución no encontrado para devolución ${idDevolucion} y producto ${idProducto}`
      );
    }

    return refundItem;
  }

  // Actualizar items de devolución
  async update(
    idDevolucion: number, 
    idProducto: number, 
    updateData: Partial<RefundItem>
  ): Promise<RefundItem> {
    const refundItem = await this.findOne(idDevolucion, idProducto);
    
    const updatedRefundItem = await this.refundItemRepository.save({
      ...refundItem,
      ...updateData,
    });

    return updatedRefundItem;
  }

  // Eliminar un item de devolución por ID de devolución y ID de producto
  async remove(idDevolucion: number, idProducto: number): Promise<void> {
    const result = await this.refundItemRepository.delete({
      id_devolucion: idDevolucion,
      id_producto: idProducto
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Item de devolución no encontrado para devolución ${idDevolucion} y producto ${idProducto}`
      );
    }
  }

  // Eliminar items de devolución por ID de devolución
  async removeByRefundId(idDevolucion: number): Promise<void> {
    await this.refundItemRepository.delete({ id_devolucion: idDevolucion });
  }

  // Obtener devolución por ID
  async getTotalByRefundId(idDevolucion: number): Promise<number> {
    const result = await this.refundItemRepository
      .createQueryBuilder('refundItem')
      .select('SUM(refundItem.cantidad * refundItem.precio_unitario)', 'total')
      .where('refundItem.id_devolucion = :idDevolucion', { idDevolucion })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  // Obtener resumen de items de devolución por ID de devolución
  async getRefundItemsSummary(idDevolucion: number): Promise<any> {
    const items = await this.findByRefundId(idDevolucion);
    
    const total = items.reduce((sum, item) => {
      return sum + (item.cantidad * parseFloat(item.precio_unitario as any));
    }, 0);

    return {
      items,
      totalItems: items.length,
      totalAmount: total
    };
  }
}