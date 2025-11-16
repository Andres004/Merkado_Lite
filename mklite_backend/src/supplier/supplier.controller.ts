import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Supplier } from 'src/entity/supplier.entity';

@Controller('/supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() supplier: Supplier) {
    return await this.supplierService.createSupplier(supplier);
  }

  @Get()
  async getAll() {
    return await this.supplierService.getAllSuppliers();
  }

  @Get('/:id_proveedor')
  async getById(@Param('id_proveedor') id: string) {
    return await this.supplierService.getSupplierById(Number(id));
  }

  @Put('/:id_proveedor')
  async update(@Param('id_proveedor') id: string, @Body() data: Partial<Supplier>) {
    return await this.supplierService.updateSupplier(Number(id), data);
  }

  @Delete('/:id_proveedor')
  async delete(@Param('id_proveedor') id: string) {
    return await this.supplierService.deleteSupplier(Number(id));
  }
}
