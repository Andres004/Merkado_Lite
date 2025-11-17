import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountProduct } from 'src/entity/discountProduct.entity';

@Injectable()
export class DiscountProductService {
  constructor(
    @InjectRepository(DiscountProduct)
    private discountProductRepository: Repository<DiscountProduct>,
  ) {}

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

  async findOne(idDescuento: number, idProducto: number): Promise<DiscountProduct> {
    const discountProduct = await this.discountProductRepository.findOne({
      where: { 
        id_descuento: idDescuento,
        id_producto: idProducto 
      },
      relations: ['discount', 'product']
    });

    if (!discountProduct) {
      throw new NotFoundException(
        `No se encontró la relación entre el descuento ${idDescuento} y el producto ${idProducto}`
      );
    }

    return discountProduct;
  }

  async remove(idDescuento: number, idProducto: number): Promise<void> {
    const result = await this.discountProductRepository.delete({
      id_descuento: idDescuento,
      id_producto: idProducto
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No se encontró la relación entre el descuento ${idDescuento} y el producto ${idProducto}`
      );
    }
  }

  async removeByDiscountId(idDescuento: number): Promise<void> {
    await this.discountProductRepository.delete({ id_descuento: idDescuento });
  }

  async removeByProductId(idProducto: number): Promise<void> {
    await this.discountProductRepository.delete({ id_producto: idProducto });
  }
}