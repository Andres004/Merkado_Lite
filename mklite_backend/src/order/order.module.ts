import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { BatchModule } from "../batch/batch.module"; 
import { InventoryModule } from "../inventory/inventory.module"; 


@Module({
    imports: [
        BatchModule, 
        InventoryModule
    ], 
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService] 
})
export class OrderModule {}
