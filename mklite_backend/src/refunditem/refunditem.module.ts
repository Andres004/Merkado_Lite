import { Module } from '@nestjs/common';
import { RefundItemService } from './refunditem.service';
import { RefundItemController } from './refunditem.controller';
import { InventoryModule } from '../inventory/inventory.module'; // Importar InventoryModule

@Module({
  imports: [InventoryModule],
  providers: [RefundItemService],
  controllers: [RefundItemController],
  exports: [RefundItemService],
})
export class RefundItemModule {}