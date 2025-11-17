import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundItem } from '../entity/refunditem.entity';
import { Refund } from 'src/entity/refund.entity';
import { Product } from 'src/entity/product.entity';
import { RefundItemService } from './refunditem.service';
import { RefundItemController } from './refunditem.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefundItem, Refund, Product])],
  providers: [RefundItemService],
  controllers: [RefundItemController],
  exports: [RefundItemService],
})
export class RefundItemModule {}