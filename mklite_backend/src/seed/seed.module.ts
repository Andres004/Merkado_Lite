import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { ProductService } from '../product/product.service';
import { ProductModule } from '../product/product.module';
import { ProductCategoryModule } from '../productcategory/productcategory.module';
import { Product } from 'src/entity/product.entity';
import { ProductCategory } from 'src/entity/productcategory.entity';

@Module({
  imports: [
    ProductModule,
    ProductCategoryModule,
    //TypeOrmModule,
    TypeOrmModule.forFeature([
      Product,
      ProductCategory
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
