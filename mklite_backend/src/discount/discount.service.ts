import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Discount } from 'src/entity/discount.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class DiscountService {
  private discountRepository: Repository<Discount>;

  constructor() {
    this.initRepositories();
  }

  // Patrón idéntico a UserService
  private initRepositories() {
    if (AppDataSource.isInitialized) {
        this.discountRepository = AppDataSource.getRepository(Discount);
    }
  }

  private getRepository(): Repository<Discount> {
    if (!this.discountRepository) this.initRepositories();
    if (!this.discountRepository) throw new Error('DataSource no está inicializado');
    return this.discountRepository;
  }

  async createDiscount(discount: Discount): Promise<Discount> {
    if (new Date(discount.fecha_inicio) >= new Date(discount.fecha_final)) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha final');
    }
    return await this.getRepository().save(discount);
  }

  async getAllDiscounts(): Promise<Discount[]> {
    return await this.getRepository().find();
  }
  
  async getDiscountById(id_descuento: number): Promise<Discount> {
    const discount = await this.getRepository().findOneBy({ id_descuento });
    if (!discount) {
      throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado`);
    }
    return discount;
  }

  async getDiscountByCode(code: string): Promise<Discount> {
    const discount = await this.getRepository().findOne({ 
        where: { codigo_cupon: code, estado_de_oferta: true } 
    });
    
    if (!discount) throw new NotFoundException('Cupón inválido o no encontrado');
    
    const now = new Date();
    if (now < discount.fecha_inicio || now > discount.fecha_final) {
        throw new BadRequestException('El cupón ha expirado o aún no es válido');
    }

    return discount;
  }

  async updateDiscount(id_descuento: number, updateData: Partial<Discount>): Promise<Discount> {
    const updateResult = await this.getRepository().update(id_descuento, updateData);
    if (updateResult.affected === 0) {
        throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para actualizar`);
    }
    return this.getDiscountById(id_descuento);
  }

  async deleteDiscount(id_descuento: number): Promise<{ message: string }> {
    const deleteResult = await this.getRepository().delete(id_descuento);
    if (deleteResult.affected === 0) {
        throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para eliminar`);
    }
    return { message: `Descuento con ID ${id_descuento} eliminado correctamente` };
  }
}