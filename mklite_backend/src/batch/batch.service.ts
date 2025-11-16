import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Batch } from 'src/entity/batch.entity';
import { AppDataSource } from 'src/data-source';
import { InventoryService } from '../inventory/inventory.service';
import { StockAlertService } from '../stockalert/stockalert.service';

@Injectable()
export class BatchService {
  private batchRepository: Repository<Batch>;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly alertService: StockAlertService,
  ) {
    this.batchRepository = AppDataSource.getRepository(Batch);
  }

  async createBatch(batch: Batch): Promise<Batch> {
    const saved = await this.batchRepository.save(batch);

    // Aumentar inventario
    await this.inventoryService.increaseStock(batch.id_producto, batch.cantidad_inicial);

    return saved;
  }

  async getAllBatches(): Promise<Batch[]> {
    return await this.batchRepository.find({
      relations: ['producto', 'proveedor'],
    });
  }

  async getById(id_lote: number): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id_lote },
      relations: ['producto', 'proveedor'],
    });

    if (!batch) {
      throw new NotFoundException(`Lote ${id_lote} no encontrado`);
    }

    return batch;
  }

  async getExpiredBatches() {
    const today = new Date().toISOString().split('T')[0];

    return await this.batchRepository
      .createQueryBuilder('lote')
      .where('lote.fecha_vencimiento < :today', { today })
      .getMany();
  }

  async getExpiring(days: number) {
    return await this.batchRepository
      .createQueryBuilder('lote')
      .where('DATEDIFF(lote.fecha_vencimiento, NOW()) <= :d', { d: days })
      .andWhere('lote.estado_lote = "activo"')
      .getMany();
  }
}
