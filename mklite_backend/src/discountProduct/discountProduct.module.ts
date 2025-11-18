import { Module } from '@nestjs/common';
import { DiscountProductService } from './discountProduct.service';
import { DiscountProductController } from './discountProduct.controller';

@Module({
  controllers: [DiscountProductController],
  providers: [DiscountProductService],
  exports: [DiscountProductService],
})
export class DiscountProductModule {}