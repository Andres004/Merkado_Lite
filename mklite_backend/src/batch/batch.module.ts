import { Module } from "@nestjs/common";
import { BatchService } from "./batch.service";
import { BatchController } from "./batch.controller";
import { InventoryModule } from "../inventory/inventory.module";
import { StockAlertModule } from "../stockalert/stockalert.module";

@Module({
    imports: [
        InventoryModule, 
        StockAlertModule 
    ], 
    controllers: [BatchController],
    providers: [BatchService],
    exports: [BatchService], 
})
export class BatchModule {}
