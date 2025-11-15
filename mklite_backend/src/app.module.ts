import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cartitem/cartitem.module';

@Module({
  imports: [UserModule, ProductModule, CartModule, CartItemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
