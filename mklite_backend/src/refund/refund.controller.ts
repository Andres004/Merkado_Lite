import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { RefundService } from './refund.service';
import { Refund } from 'src/entity/refund.entity';

@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  async create(@Body() refundData: Partial<Refund>): Promise<Refund> {
    return await this.refundService.create(refundData);
  }

  @Get()
  async findAll(): Promise<Refund[]> {
    return await this.refundService.findAll();
  }

  /*@Get('vendedor/:vendedorId')
  async findByVendedorId(@Param('vendedorId', ParseIntPipe) vendedorId: number): Promise<Refund[]> {
    return await this.refundService.findByVendedorId(vendedorId);
  }

  @Get('pedido/:pedidoId')
  async findByPedidoId(@Param('pedidoId', ParseIntPipe) pedidoId: number): Promise<Refund[]> {
    return await this.refundService.findByPedidoId(pedidoId);
  }

  @Get('pedido/:pedidoId/vendedor/:vendedorId')
  async getRefundsByPedidoAndVendedor(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @Param('vendedorId', ParseIntPipe) vendedorId: number,
  ): Promise<Refund[]> {
    return await this.refundService.getRefundsByPedidoAndVendedor(pedidoId, vendedorId);
  }*/

  @Get('vendedor/:vendedorId/total')
  async getTotalByVendedorId(@Param('vendedorId', ParseIntPipe) vendedorId: number): Promise<{ total: number }> {
    const total = await this.refundService.getTotalRefundsByVendedor(vendedorId);
    return { total };
  }

  @Get('date-range')
  async getByDateRange(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<Refund[]> {
    return await this.refundService.getRefundsByDateRange(
      new Date(fechaInicio),
      new Date(fechaFin)
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return await this.refundService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Refund>,
  ): Promise<Refund> {
    return await this.refundService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.refundService.remove(id);
  }
}