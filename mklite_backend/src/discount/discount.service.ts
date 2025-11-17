import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Discount } from 'src/entity/discount.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class DiscountService {
  private discountRepository: Repository<Discount>;

  constructor() {
    this.discountRepository = AppDataSource.getRepository(Discount);
  }

  async createDiscount(discount: Discount): Promise<Discount> {
    return await this.discountRepository.save(discount);
  }

  async getAllDiscounts(): Promise<Discount[]> {
    return await this.discountRepository.find();
  }
  
  async getDiscountById(id_descuento: number): Promise<Discount> {
  const discount = await this.discountRepository.findOneBy({ id_descuento });
  if (!discount) {
    throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado`);
  }
  return discount;
}

    async updateDiscount(id_descuento: number, updateData: Partial<Discount>): Promise<Discount> {
    const updateResult = await this.discountRepository.update(id_descuento, updateData);
    if (updateResult.affected === 0) {
        throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para actualizar`);
    }
    return this.getDiscountById(id_descuento);
    }

    async deleteDiscount(id_descuento: number): Promise<{ message: string }> {
    const deleteResult = await this.discountRepository.delete(id_descuento);
    if (deleteResult.affected === 0) {
        throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para eliminar`);
    }
    return { message: `Descuento con ID ${id_descuento} eliminado correctamente` };
    }
}