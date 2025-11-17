import { Body, Controller, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { Inventory } from "src/entity/inventory.entity";

@Controller('inventory')
export class InventoryController {

    constructor(private readonly inventoryService: InventoryService) {}

    @Get('/:id_producto')
    async getInventory(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return await this.inventoryService.getInventoryByProductId(id_producto);
    }

    @Post('/:id_producto')
    async createOrUpdateInventory(
        @Param('id_producto', ParseIntPipe) id_producto: number, 
        @Body() inventory: Partial<Inventory>
    ) {
        return await this.inventoryService.setInventory(id_producto, inventory);
    }

    @Put('/stock/:id_producto')
    async updateStockLevel(
        @Param('id_producto', ParseIntPipe) id_producto: number,
        @Body('stock_disponible') stock_disponible: number
    ) {
        return await this.inventoryService.updateStockLevel(id_producto, stock_disponible);
    }
}