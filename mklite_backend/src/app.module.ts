import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SupplierModule } from './supplier/supplier.module';
import { BatchModule } from './batch/batch.module';
import { InventoryModule } from './inventory/inventory.module';
import { StockAlertModule } from './stockalert/stockalert.module';

import { InventorySchedulerService } from './common/schedulers/inventory-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SupplierModule,
    BatchModule,
    InventoryModule,
    StockAlertModule,
  ],
  providers: [InventorySchedulerService],
})
export class AppModule {}
