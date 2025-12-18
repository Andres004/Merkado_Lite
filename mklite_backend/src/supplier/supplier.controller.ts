import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { Supplier } from "src/entity/supplier.entity";

@Controller('supplier')
export class SupplierController {

    constructor(private readonly supplierService: SupplierService) {}

    @Post()
    async createSupplier(@Body() supplier: Supplier) {
        return await this.supplierService.createSupplier(supplier);
    }

    @Get()
    async getAllSuppliers() {
        return await this.supplierService.getAllSuppliers();
    }

    @Get('/:id_proveedor')
    async getSupplierById(@Param('id_proveedor', ParseIntPipe) id_proveedor: number) {
        return await this.supplierService.getSupplierById(id_proveedor);
    }

    @Put('/:id_proveedor')
    async updateSupplier(
        @Param('id_proveedor', ParseIntPipe) id_proveedor: number, 
        @Body() supplier: Partial<Supplier>
    ) {
        return await this.supplierService.updateSupplier(id_proveedor, supplier);
    }

    @Delete('/:id_proveedor')
    async deleteSupplier(@Param('id_proveedor', ParseIntPipe) id_proveedor: number) {
        return await this.supplierService.deleteSupplier(id_proveedor);
    }
}