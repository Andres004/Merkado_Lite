import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DiscountProduct } from 'src/entity/discountProduct.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class DiscountProductService {
  private discountProductRepository: Repository<DiscountProduct>;

  constructor() {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.discountProductRepository = AppDataSource.getRepository(DiscountProduct);
  }

  async create(idDescuento: number, idProducto: number): Promise<DiscountProduct> {
    // Verificar si ya existe la relación
    const exists = await this.discountProductRepository.findOne({
      where: { id_descuento: idDescuento, id_producto: idProducto }
    });
    
    if (exists) {
      throw new ConflictException('Este producto ya tiene asignado este descuento');
    }

    const discountProduct = this.discountProductRepository.create({
      id_descuento: idDescuento,
      id_producto: idProducto,
    });
    
    return await this.discountProductRepository.save(discountProduct);
  }

  async findAll(): Promise<DiscountProduct[]> {
    return await this.discountProductRepository.find({
      relations: ['discount', 'product']
    });
  }

  async findByDiscountId(idDescuento: number): Promise<DiscountProduct[]> {
    return await this.discountProductRepository.find({
      where: { id_descuento: idDescuento },
      relations: ['discount', 'product']
    });
  }

  async findByProductId(idProducto: number): Promise<DiscountProduct[]> {
    return await this.discountProductRepository.find({
      where: { id_producto: idProducto },
      relations: ['discount', 'product']
    });
  }

  async remove(idDescuento: number, idProducto: number): Promise<{ message: string }> {
    const result = await this.discountProductRepository.delete({
      id_descuento: idDescuento,
      id_producto: idProducto
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No se encontró la relación entre el descuento ${idDescuento} y el producto ${idProducto}`
      );
    }
    return { message: 'Producto removido del descuento correctamente' };
  }
}