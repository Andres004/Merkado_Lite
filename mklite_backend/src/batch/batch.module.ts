import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { InventoryModule } from '../inventory/inventory.module';
import { StockAlertModule } from '../stockalert/stockalert.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from '../entity/batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch]),
    InventoryModule,
    StockAlertModule,
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
