import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundItem } from '../entity/refundItem.entity';
import { Refund } from 'src/entity/refund.entity';
import { Product } from 'src/entity/product.entity';
import { RefundItemService } from './refundItem.service';
import { RefundItemController } from './refundItem.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefundItem, Refund, Product])],
  providers: [RefundItemService],
  controllers: [RefundItemController],
  exports: [RefundItemService],
})
export class RefundItemModule {}