import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RefundItemService } from './refundItem.service';
import { RefundItem } from '../entity/refundItem.entity';

@Controller('refundItems')
export class RefundItemController {
  constructor(private readonly refundItemService: RefundItemService) {}

  @Post()
  async create(@Body() refundItemData: Partial<RefundItem>): Promise<RefundItem> {
    return await this.refundItemService.create(refundItemData);
  }

  @Get()
  async findAll(): Promise<RefundItem[]> {
    return await this.refundItemService.findAll();
  }

  @Get('refund/:idDevolucion')
  async findByRefundId(@Param('idDevolucion', ParseIntPipe) idDevolucion: number): Promise<RefundItem[]> {
    return await this.refundItemService.findByRefundId(idDevolucion);
  }

  @Get('refund/:idDevolucion/summary')
  async getRefundItemsSummary(@Param('idDevolucion', ParseIntPipe) idDevolucion: number): Promise<any> {
    return await this.refundItemService.getRefundItemsSummary(idDevolucion);
  }

  @Get('product/:idProducto')
  async findByProductId(@Param('idProducto', ParseIntPipe) idProducto: number): Promise<RefundItem[]> {
    return await this.refundItemService.findByProductId(idProducto);
  }

  @Get('refund/:idDevolucion/total')
  async getTotalByRefundId(@Param('idDevolucion', ParseIntPipe) idDevolucion: number): Promise<{ total: number }> {
    const total = await this.refundItemService.getTotalByRefundId(idDevolucion);
    return { total };
  }

  @Get(':idDevolucion/:idProducto')
  async findOne(
    @Param('idDevolucion', ParseIntPipe) idDevolucion: number,
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ): Promise<RefundItem> {
    return await this.refundItemService.findOne(idDevolucion, idProducto);
  }

  @Put(':idDevolucion/:idProducto')
  async update(
    @Param('idDevolucion', ParseIntPipe) idDevolucion: number,
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Body() updateData: Partial<RefundItem>,
  ): Promise<RefundItem> {
    return await this.refundItemService.update(idDevolucion, idProducto, updateData);
  }

  @Delete(':idDevolucion/:idProducto')
  async remove(
    @Param('idDevolucion', ParseIntPipe) idDevolucion: number,
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ): Promise<void> {
    await this.refundItemService.remove(idDevolucion, idProducto);
  }

  @Delete('refund/:idDevolucion')
  async removeByRefundId(@Param('idDevolucion', ParseIntPipe) idDevolucion: number): Promise<void> {
    await this.refundItemService.removeByRefundId(idDevolucion);
  }
}