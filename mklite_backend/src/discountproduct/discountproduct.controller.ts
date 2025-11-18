import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { DiscountProductService } from './discountproduct.service';
import { DiscountProduct } from 'src/entity/discountproduct.entity';

@Controller('discount-products')
export class DiscountProductController {
  constructor(private readonly discountProductService: DiscountProductService) {}

  @Post()
  async create(
    @Body('id_descuento', ParseIntPipe) idDescuento: number,
    @Body('id_producto', ParseIntPipe) idProducto: number,
  ): Promise<DiscountProduct> {
    return await this.discountProductService.create(idDescuento, idProducto);
  }

  @Get()
  async findAll(): Promise<DiscountProduct[]> {
    return await this.discountProductService.findAll();
  }

  @Get('discount/:id')
  async findByDiscountId(@Param('id', ParseIntPipe) idDescuento: number): Promise<DiscountProduct[]> {
    return await this.discountProductService.findByDiscountId(idDescuento);
  }

  @Get('product/:id')
  async findByProductId(@Param('id', ParseIntPipe) idProducto: number): Promise<DiscountProduct[]> {
    return await this.discountProductService.findByProductId(idProducto);
  }

  @Delete('discount/:idDescuento/product/:idProducto')
  async remove(
    @Param('idDescuento', ParseIntPipe) idDescuento: number,
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ) {
    return await this.discountProductService.remove(idDescuento, idProducto);
  }
}