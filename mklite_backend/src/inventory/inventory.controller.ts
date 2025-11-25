import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { Inventory } from "src/entity/inventory.entity";
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {

    constructor(private readonly inventoryService: InventoryService) {}

    // NUEVO: Endpoint para la tabla de gestión (Admin/Almacén)
    @Get()
    @Roles('Administrador', 'Almacén', 'Ventas')
    async getAllInventory() {
        return await this.inventoryService.getAllInventory();
    }

    @Get('/:id_producto')
    @Roles('Administrador', 'Almacén', 'Ventas')
    async getInventory(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return await this.inventoryService.getInventoryByProductId(id_producto);
    }

    @Post('/:id_producto')
    @Roles('Administrador', 'Almacén')
    async createOrUpdateInventory(
        @Param('id_producto', ParseIntPipe) id_producto: number, 
        @Body() inventory: Partial<Inventory>
    ) {
        return await this.inventoryService.setInventory(id_producto, inventory);
    }

    @Put('/stock/:id_producto')
    @Roles('Administrador', 'Almacén')
    async updateStockLevel(
        @Param('id_producto', ParseIntPipe) id_producto: number,
        @Body('stock_disponible') stock_disponible: number
    ) {
        return await this.inventoryService.updateStockLevel(id_producto, stock_disponible);
    }
}