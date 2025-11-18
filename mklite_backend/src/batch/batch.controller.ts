import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { BatchService } from "./batch.service";
import { Batch } from "src/entity/batch.entity";

@Controller('batch')
export class BatchController {

    constructor(private readonly batchService: BatchService) {}

    @Post()
    async createBatch(@Body() batch: Batch) {
        return await this.batchService.createBatch(batch);
    }

    @Get()
    async getAllBatches() {
        return await this.batchService.getAllBatches();
    }

    @Get('/:id_lote')
    async getBatchById(@Param('id_lote', ParseIntPipe) id_lote: number) {
        return await this.batchService.getBatchById(id_lote);
    }

    // Endpoint específico para ver lotes de un producto
    @Get('/product/:id_producto')
    async getBatchesByProduct(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return await this.batchService.getBatchesByProduct(id_producto);
    }

    // Endpoint específico para ver lotes de un proveedor
    @Get('/supplier/:id_proveedor')
    async getBatchesBySupplier(@Param('id_proveedor', ParseIntPipe) id_proveedor: number) {
        return await this.batchService.getBatchesBySupplier(id_proveedor);
    }

    @Put('/:id_lote')
    async updateBatch(
        @Param('id_lote', ParseIntPipe) id_lote: number, 
        @Body() batch: Partial<Batch>
    ) {
        return await this.batchService.updateBatch(id_lote, batch);
    }

    @Delete('/:id_lote')
    async deleteBatch(@Param('id_lote', ParseIntPipe) id_lote: number) {
        return await this.batchService.deleteBatch(id_lote);
    }
}
