import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('/:id_producto')
  async getInv(@Param('id_producto') id: string) {
    return await this.inventoryService.getInventory(Number(id));
  }

  @Put('/:id_producto/minimo')
  async setMin(
    @Param('id_producto') id: string,
    @Body() body: { stock_minimo: number },
  ) {
    return await this.inventoryService.setMinimumStock(Number(id), body.stock_minimo);
  }

  @Get('/warning/low-stock')
  async getLowStock() {
    return await this.inventoryService.getLowStockProducts();
  }
}
