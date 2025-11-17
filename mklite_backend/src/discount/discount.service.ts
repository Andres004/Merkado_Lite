import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Discount } from 'src/entity/discount.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class DiscountService {
  private discountRepository: Repository<Discount>;

  constructor() {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.discountRepository = AppDataSource.getRepository(Discount);
  }

  async createDiscount(discount: Discount): Promise<Discount> {
    // Validar fechas
    if (new Date(discount.fecha_inicio) >= new Date(discount.fecha_final)) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha final');
    }
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

  // Buscar por código de cupón (Necesario para HU-F13)
  async getDiscountByCode(code: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({ 
        where: { codigo_cupon: code, estado_de_oferta: true } 
    });
    
    if (!discount) throw new NotFoundException('Cupón inválido o no encontrado');
    
    // Validar vigencia
    const now = new Date();
    if (now < discount.fecha_inicio || now > discount.fecha_final) {
        throw new BadRequestException('El cupón ha expirado o aún no es válido');
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