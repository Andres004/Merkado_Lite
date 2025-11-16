import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Inventory } from 'src/entity/inventory.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class InventoryService {
  private invRepository: Repository<Inventory>;

  constructor() {
    this.invRepository = AppDataSource.getRepository(Inventory);
  }

  async getInventory(id_producto: number): Promise<Inventory> {
    const inv = await this.invRepository.findOneBy({ id_producto });

    if (!inv) {
      throw new NotFoundException(`Inventario de producto ${id_producto} no encontrado`);
    }

    return inv;
  }

  async setMinimumStock(id_producto: number, min: number) {
    await this.invRepository.update(id_producto, {
      stock_minimo: min,
      ultima_actualizacion: new Date(),
    });

    return this.getInventory(id_producto);
  }

  async increaseStock(id_producto: number, cantidad: number) {
    let inv = await this.invRepository.findOneBy({ id_producto });

    if (!inv) {
      inv = this.invRepository.create({
        id_producto,
        stock_disponible: cantidad,
        stock_reservado: 0,
        stock_minimo: 0,
        ultima_actualizacion: new Date(),
      });
      return await this.invRepository.save(inv);
    }

    inv.stock_disponible += cantidad;
    inv.ultima_actualizacion = new Date();

    return await this.invRepository.save(inv);
  }

  async decreaseStock(id_producto: number, cantidad: number) {
    const inv = await this.getInventory(id_producto);

    if (inv.stock_disponible < cantidad) {
      throw new NotFoundException('Stock insuficiente');
    }

    inv.stock_disponible -= cantidad;
    inv.ultima_actualizacion = new Date();

    return await this.invRepository.save(inv);
  }

  async getLowStockProducts(): Promise<Inventory[]> {
  return await this.invRepository
    .createQueryBuilder('inv')
    .leftJoinAndSelect('inv.producto', 'producto')
    .where('inv.stock_disponible < inv.stock_minimo')
    .getMany();
}
}
