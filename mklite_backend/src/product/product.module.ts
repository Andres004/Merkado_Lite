import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../entity/product.entity';
import { Batch } from '../entity/batch.entity';
import { Inventory } from '../entity/inventory.entity';
import { StockAlert } from '../entity/stockalert.entity';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Batch, Inventory, StockAlert]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
