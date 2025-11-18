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
import { InventoryModule } from './inventory/inventory.module';
import { BatchModule } from './batch/batch.module';
import { StockAlertModule } from './stockalert/stockalert.module';
import { SupplierModule } from './supplier/supplier.module';
import { OrderModule } from './order/order.module';
import { ShipmentModule } from './shipment/shipment.module';


@Module({
  imports: [UserModule, ProductModule, CartModule, CartItemModule, RoleModule
    , UserroleModule, ProductCategoryModule, CategoryModule, InventoryModule, 
  BatchModule, StockAlertModule, SupplierModule, OrderModule, ShipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
