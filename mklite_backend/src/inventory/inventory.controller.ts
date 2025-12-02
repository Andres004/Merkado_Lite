<<<<<<< HEAD
import { Body, Controller, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { Inventory } from "src/entity/inventory.entity";

@Controller('inventory')
=======
import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { Inventory } from "src/entity/inventory.entity";
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
>>>>>>> Backend-andy
export class InventoryController {

    constructor(private readonly inventoryService: InventoryService) {}

<<<<<<< HEAD
    @Get('/:id_producto')
=======
    // NUEVO: Endpoint para la tabla de gestión (Admin/Almacén)
    @Get()
    @Roles('Administrador', 'Almacén', 'Ventas')
    async getAllInventory() {
        return await this.inventoryService.getAllInventory();
    }

    @Get('/:id_producto')
    @Roles('Administrador', 'Almacén', 'Ventas')
>>>>>>> Backend-andy
    async getInventory(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return await this.inventoryService.getInventoryByProductId(id_producto);
    }

    @Post('/:id_producto')
<<<<<<< HEAD
=======
    @Roles('Administrador', 'Almacén')
>>>>>>> Backend-andy
    async createOrUpdateInventory(
        @Param('id_producto', ParseIntPipe) id_producto: number, 
        @Body() inventory: Partial<Inventory>
    ) {
        return await this.inventoryService.setInventory(id_producto, inventory);
    }

    @Put('/stock/:id_producto')
<<<<<<< HEAD
=======
    @Roles('Administrador', 'Almacén')
>>>>>>> Backend-andy
    async updateStockLevel(
        @Param('id_producto', ParseIntPipe) id_producto: number,
        @Body('stock_disponible') stock_disponible: number
    ) {
        return await this.inventoryService.updateStockLevel(id_producto, stock_disponible);
    }
}