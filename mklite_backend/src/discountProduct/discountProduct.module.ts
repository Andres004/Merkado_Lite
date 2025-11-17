import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountProduct } from 'src/entity/discountProduct.entity';
import { DiscountProductService } from './discountProduct.service';
import { DiscountProductController } from './discountProduct.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountProduct])],
  providers: [DiscountProductService],
  controllers: [DiscountProductController],
  exports: [DiscountProductService],
})
export class DiscountProductModule {}