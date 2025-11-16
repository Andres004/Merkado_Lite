import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cartitem/cartitem.module';
import { RoleModule } from './role/role.module';
import { UserroleModule } from './userrole/userrole.module';
import { ProductCategoryModule } from './productcategory/productcategory.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [UserModule, ProductModule, CartModule, CartItemModule, RoleModule
    , UserroleModule, ProductCategoryModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
