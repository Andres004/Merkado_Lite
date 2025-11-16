import { Module } from '@nestjs/common';
import { StockAlertService } from './stockalert.service';
import { StockAlertController } from './stockalert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAlert } from '../entity/stockalert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockAlert])],
  controllers: [StockAlertController],
  providers: [StockAlertService],
  exports: [StockAlertService],
})
export class StockAlertModule {}