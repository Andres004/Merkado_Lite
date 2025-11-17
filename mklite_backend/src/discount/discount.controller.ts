import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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
  async getDiscountById(@Param('id_descuento') id_descuento: string) {
    return await this.discountService.getDiscountById(Number(id_descuento));
  }

  @Put('/:id_descuento')
  async updateDiscount(@Param('id_descuento') id_descuento: string, @Body() updateData: Partial<Discount>) {
    return await this.discountService.updateDiscount(Number(id_descuento), updateData);
  }

  @Delete('/:id_descuento')
  async deleteDiscount(@Param('id_descuento') id_descuento: string) {
    return await this.discountService.deleteDiscount(Number(id_descuento));
  }
  
}