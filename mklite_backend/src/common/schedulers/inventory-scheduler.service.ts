import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { AppDataSource } from 'src/data-source';
import { Batch } from 'src/entity/batch.entity';
import { Inventory } from 'src/entity/inventory.entity';
import { StockAlert } from 'src/entity/stockalert.entity';

@Injectable()
export class InventorySchedulerService {
  private readonly logger = new Logger(InventorySchedulerService.name);
  private batchRepo: Repository<Batch>;
  private inventoryRepo: Repository<Inventory>;
  private alertRepo: Repository<StockAlert>;

  // configurable: días antes de vencimiento para alertar
  private EXPIRING_DAYS = 7;

  constructor() {
    this.batchRepo = AppDataSource.getRepository(Batch);
    this.inventoryRepo = AppDataSource.getRepository(Inventory);
    this.alertRepo = AppDataSource.getRepository(StockAlert);
  }

  // Ejecutar cada día a la medianoche (puedes ajustar)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyChecks() {
    this.logger.log('Iniciando chequeos diarios de lotes e inventario...');
    await this.markExpiredBatchesAndAlert();
    await this.alertExpiringBatches();
    await this.alertLowStock();
    this.logger.log('Chequeos diarios finalizados.');
  }

  private async markExpiredBatchesAndAlert() {
    const today = new Date();
    const expired = await this.batchRepo.find({
      where: { fecha_vencimiento: () => `fecha_vencimiento <= '${today.toISOString().slice(0,10)}'` }
    } as any); // TypeORM QueryHelper simplificado

    for (const lote of expired) {
      if (lote.estado_lote !== 'vencido') {
        lote.estado_lote = 'vencido';
        await this.batchRepo.save(lote);

        // Crear alerta por vencimiento
        const mensaje = `Lote ${lote.id_lote} del producto ${lote.id_producto} vencido el ${lote.fecha_vencimiento.toISOString().slice(0,10)}`;
        await this.alertRepo.save({
          id_producto: lote.id_producto,
          tipo_alerta: 'Vencimiento',
          fecha_alerta: new Date(),
          mensaje,
        } as StockAlert);
      }
    }
  }

  private async alertExpiringBatches() {
    const now = new Date();
    const threshold = new Date(now.getTime() + this.EXPIRING_DAYS * 24 * 60 * 60 * 1000);
    // lotes con fecha_vencimiento entre hoy (exclusive) y threshold (inclusive)
    const q = this.batchRepo.createQueryBuilder('lote')
      .where('lote.fecha_vencimiento > :today AND lote.fecha_vencimiento <= :thresh', {
        today: now.toISOString().slice(0,10),
        thresh: threshold.toISOString().slice(0,10),
      });
    const expiring = await q.getMany();

    for (const lote of expiring) {
      // prevenir alertas duplicadas: busca si ya existe alert reciente similar (por ejemplo 1 día)
      const existing = await this.alertRepo.findOne({
        where: {
          id_producto: lote.id_producto,
          tipo_alerta: 'Vencimiento',
          mensaje: () => `mensaje LIKE '%Lote ${lote.id_lote}%'`
        } as any
      });

      if (!existing) {
        const mensaje = `Lote ${lote.id_lote} del producto ${lote.id_producto} vence el ${lote.fecha_vencimiento.toISOString().slice(0,10)}`;
        await this.alertRepo.save({
          id_producto: lote.id_producto,
          tipo_alerta: 'Vencimiento',
          fecha_alerta: new Date(),
          mensaje,
        } as StockAlert);
      }
    }
  }

  private async alertLowStock() {
    // encontrar inventarios con stock_disponible <= stock_minimo
    const low = await this.inventoryRepo.createQueryBuilder('inv')
      .where('inv.stock_disponible <= inv.stock_minimo')
      .getMany();

    for (const inv of low) {
      // evitar duplicados: verificar alerta activa reciente
      const exist = await this.alertRepo.findOne({
        where: {
          id_producto: inv.id_producto,
          tipo_alerta: 'Umbral mínimo',
        } as any
      });

      if (!exist) {
        const mensaje = `Producto ${inv.id_producto} alcanzó umbral mínimo (disponible: ${inv.stock_disponible}, mínimo: ${inv.stock_minimo})`;
        await this.alertRepo.save({
          id_producto: inv.id_producto,
          tipo_alerta: 'Umbral mínimo',
          fecha_alerta: new Date(),
          mensaje,
        } as StockAlert);
      }
    }
  }
}
