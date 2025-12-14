import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { Discount } from 'src/entity/discount.entity';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  //async createDiscount(@Body() discount: Discount) {
  async createDiscount(@Body() discount: CreateDiscountDto) {
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

  @Get('/code/:code')
  async getDiscountByCode(@Param('code') code: string) {
    return await this.discountService.getDiscountByCode(code);
  }

  @Put('/:id_descuento')
  //async updateDiscount(@Param('id_descuento', ParseIntPipe) id_descuento: number, @Body() updateData: Partial<Discount>) {
  async updateDiscount(
    @Param('id_descuento', ParseIntPipe) id_descuento: number,
    @Body() updateData: UpdateDiscountDto,
  ) {
    return await this.discountService.updateDiscount(id_descuento, updateData);
  }

  @Delete('/:id_descuento')
  async deleteDiscount(@Param('id_descuento', ParseIntPipe) id_descuento: number) {
    return await this.discountService.deleteDiscount(id_descuento);
  }
}