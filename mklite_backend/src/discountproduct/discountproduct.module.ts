import { Module } from '@nestjs/common';
import { DiscountProductService } from './discountproduct.service';
import { DiscountProductController } from './discountproduct.controller';

@Module({
  controllers: [DiscountProductController],
  providers: [DiscountProductService],
  exports: [DiscountProductService],
})
export class DiscountProductModule {}