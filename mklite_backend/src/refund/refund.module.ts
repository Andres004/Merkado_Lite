import { Module } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [RefundService],
  controllers: [RefundController],
  exports: [RefundService],
})
export class RefundModule {}