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
import { AuthModule } from './auth/auth.module';
import { RefundModule } from './refund/refund.module';
import { RefundItemModule } from './refunditem/refunditem.module';
import { DiscountModule } from './discount/discount.module';
import { DiscountProductModule } from './discountproduct/discountproduct.module';
import { ChatModule } from './chat/chat.module';
import { FavoriteModule } from './favorite/favorite.module';
//
import { SeedService } from './seed/seed.service'; // Importa el servicio
// import { UserModule } from './user/user.module';
//import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entity/category.entity'; // Importar la entidad
import { AdminReportsModule } from './admin-reports/admin-reports.module';

@Module({
  imports: [UserModule, ProductModule, CartModule, CartItemModule, RoleModule
  , UserroleModule, ProductCategoryModule, CategoryModule, InventoryModule, 
  BatchModule, StockAlertModule, SupplierModule, OrderModule, ShipmentModule,
  AuthModule, RefundModule, RefundItemModule, DiscountModule, DiscountProductModule,
  ChatModule, FavoriteModule, AdminReportsModule,],
  controllers: [AppController],
  providers: [AppService,SeedService],
})
export class AppModule {}

//TypeOrmModule.forFeature([Category]),