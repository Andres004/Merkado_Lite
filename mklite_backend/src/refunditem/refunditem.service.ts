import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
<<<<<<< HEAD:mklite_backend/src/refundItem/refundItem.service.ts
import { RefundItem } from 'src/entity/refundItem.entity';
import { Refund } from 'src/entity/refund.entity';
import { Product } from 'src/entity/product.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class RefundItemService {
  constructor(
    @InjectRepository(RefundItem)
    private refundItemRepository: Repository<RefundItem>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private inventoryService: InventoryService,
  ) {}

  async create(refundItemData: Partial<RefundItem>): Promise<RefundItem> {
    // 1. Validar devolución
=======
import { RefundItem } from '../entity/refunditem.entity';
import { Refund } from 'src/entity/refund.entity';
import { Product } from 'src/entity/product.entity';
import { InventoryService } from '../inventory/inventory.service';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class RefundItemService {
  private refundItemRepository: Repository<RefundItem>;
  private refundRepository: Repository<Refund>;
  private productRepository: Repository<Product>;

  constructor(
    private inventoryService: InventoryService, 
  ) {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.refundItemRepository = AppDataSource.getRepository(RefundItem);
    this.refundRepository = AppDataSource.getRepository(Refund);
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async create(refundItemData: Partial<RefundItem>): Promise<RefundItem> {
>>>>>>> Backend-andy:mklite_backend/src/refunditem/refunditem.service.ts
    const refund = await this.refundRepository.findOne({
      where: { id_devolucion: refundItemData.id_devolucion }
    });
    if (!refund) throw new NotFoundException(`Devolución ${refundItemData.id_devolucion} no encontrada`);

<<<<<<< HEAD:mklite_backend/src/refundItem/refundItem.service.ts
    // 2. Validar producto
=======
>>>>>>> Backend-andy:mklite_backend/src/refunditem/refunditem.service.ts
    const product = await this.productRepository.findOne({
      where: { id_producto: refundItemData.id_producto }
    });
    if (!product) throw new NotFoundException(`Producto ${refundItemData.id_producto} no encontrado`);

<<<<<<< HEAD:mklite_backend/src/refundItem/refundItem.service.ts
    // 3. Validar duplicados
=======
>>>>>>> Backend-andy:mklite_backend/src/refunditem/refunditem.service.ts
    const existingItem = await this.refundItemRepository.findOne({
      where: {
        id_devolucion: refundItemData.id_devolucion,
        id_producto: refundItemData.id_producto
      }
    });
    if (existingItem) throw new BadRequestException('Producto ya registrado en la devolución');

<<<<<<< HEAD:mklite_backend/src/refundItem/refundItem.service.ts
    // 4. Guardar item
    const refundItem = this.refundItemRepository.create(refundItemData);
    const savedItem = await this.refundItemRepository.save(refundItem);

    // 5. Actualizar inventario (Mover a stock dañado según CU-21)
=======
    const refundItem = this.refundItemRepository.create(refundItemData);
    const savedItem = await this.refundItemRepository.save(refundItem);

    // Lógica de Negocio (CU-21/HU-F26): Mover a stock dañado/anulado
>>>>>>> Backend-andy:mklite_backend/src/refunditem/refunditem.service.ts
    const inventory = await this.inventoryService.getInventoryByProductId(savedItem.id_producto);
    inventory.stock_danado = (inventory.stock_danado || 0) + savedItem.cantidad;
    await this.inventoryService.setInventory(savedItem.id_producto, inventory);

    return savedItem;
  }

  async findAll(): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      relations: ['refund', 'product']
    });
  }

  async findByRefundId(idDevolucion: number): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      where: { id_devolucion: idDevolucion },
      relations: ['refund', 'product']
    });
  }

  async findByProductId(idProducto: number): Promise<RefundItem[]> {
    return await this.refundItemRepository.find({
      where: { id_producto: idProducto },
      relations: ['refund', 'product']
    });
  }

  async findOne(idDevolucion: number, idProducto: number): Promise<RefundItem> {
    const refundItem = await this.refundItemRepository.findOne({
      where: { 
        id_devolucion: idDevolucion,
        id_producto: idProducto 
      },
      relations: ['refund', 'product']
    });

    if (!refundItem) throw new NotFoundException('Item de devolución no encontrado');
    return refundItem;
  }

  async update(idDevolucion: number, idProducto: number, updateData: Partial<RefundItem>): Promise<RefundItem> {
    const refundItem = await this.findOne(idDevolucion, idProducto);
    return await this.refundItemRepository.save({ ...refundItem, ...updateData });
  }

  async remove(idDevolucion: number, idProducto: number): Promise<void> {
    const result = await this.refundItemRepository.delete({
      id_devolucion: idDevolucion,
      id_producto: idProducto
    });
    if (result.affected === 0) throw new NotFoundException('Item de devolución no encontrado');
  }

  async removeByRefundId(idDevolucion: number): Promise<void> {
    await this.refundItemRepository.delete({ id_devolucion: idDevolucion });
  }

  async getTotalByRefundId(idDevolucion: number): Promise<number> {
    const result = await this.refundItemRepository
      .createQueryBuilder('refundItem')
      .select('SUM(refundItem.cantidad * refundItem.precio_unitario)', 'total')
      .where('refundItem.id_devolucion = :idDevolucion', { idDevolucion })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getRefundItemsSummary(idDevolucion: number): Promise<any> {
    const items = await this.findByRefundId(idDevolucion);
    const total = items.reduce((sum, item) => {
      return sum + (item.cantidad * Number(item.precio_unitario));
    }, 0);

    return {
      items,
      totalItems: items.length,
      totalAmount: total
    };
  }
}