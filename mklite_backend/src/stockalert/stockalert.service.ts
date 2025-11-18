import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StockAlert } from 'src/entity/stockalert.entity'; // Ajusta la ruta
import { AppDataSource } from 'src/data-source';

@Injectable()
export class StockAlertService {
    private alertRepository: Repository<StockAlert>;

    constructor() {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.alertRepository = AppDataSource.getRepository(StockAlert);
    }

    async createAlert(alert: StockAlert): Promise<StockAlert> {
        // Se asegura de registrar la fecha actual si no viene
        if (!alert.fecha_alerta) {
            alert.fecha_alerta = new Date();
        }
        return await this.alertRepository.save(alert);
    }

    async getAlertsByProductId(id_producto: number): Promise<StockAlert[]> {
        const alerts = await this.alertRepository.find({
            where: { id_producto },
            order: { fecha_alerta: 'DESC' } // Las más recientes primero
        });
        return alerts;
    }

    async getAllAlerts(): Promise<StockAlert[]> {
        return await this.alertRepository.find({
            order: { fecha_alerta: 'DESC' }
        });
    }

    async deleteAlert(id_alerta: number): Promise<{ message: string }> {
        const result = await this.alertRepository.delete(id_alerta);
        if (result.affected === 0) {
            throw new NotFoundException(`Alerta con ID ${id_alerta} no encontrada`);
        }
        return { message: `Alerta ${id_alerta} eliminada con éxito` };
    }
}
