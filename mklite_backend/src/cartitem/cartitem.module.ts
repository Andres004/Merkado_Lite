import { Module } from '@nestjs/common';
import { CartItemService } from './cartitem.service';
import { CartItemController } from './cartitem.controller';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';  

@Module({
  imports: [ProductModule, CartModule],  
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule {}
