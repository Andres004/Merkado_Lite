import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StockAlert } from 'src/entity/stockalert.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class StockAlertService {
  private alertRepo: Repository<StockAlert>;

  constructor() {
    this.alertRepo = AppDataSource.getRepository(StockAlert);
  }

  async createAlert(alert: StockAlert): Promise<StockAlert> {
    alert.fecha_alerta = new Date();
    return await this.alertRepo.save(alert);
  }

  async getAllAlerts(): Promise<StockAlert[]> {
    return await this.alertRepo.find({ relations: ['producto'] });
  }
}
