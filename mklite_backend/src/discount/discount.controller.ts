import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { Discount } from 'src/entity/discount.entity';
import { DiscountService } from './discount.service';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  async createDiscount(@Body() discount: Discount) {
    return await this.discountService.createDiscount(discount);
  }

  @Get()
  async getAllDiscounts() {
    return await this.discountService.getAllDiscounts();
  }

  @Get('/:id_descuento')
  async getDiscountById(@Param('id_descuento', ParseIntPipe) id_descuento: number) {
    return await this.discountService.getDiscountById(id_descuento);
  }

  @Get('/code/:code') // Nuevo endpoint para validar cupones en checkout
  async getDiscountByCode(@Param('code') code: string) {
    return await this.discountService.getDiscountByCode(code);
  }

  @Put('/:id_descuento')
  async updateDiscount(@Param('id_descuento', ParseIntPipe) id_descuento: number, @Body() updateData: Partial<Discount>) {
    return await this.discountService.updateDiscount(id_descuento, updateData);
  }

  @Delete('/:id_descuento')
  async deleteDiscount(@Param('id_descuento', ParseIntPipe) id_descuento: number) {
    return await this.discountService.deleteDiscount(id_descuento);
  }
}