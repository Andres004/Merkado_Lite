import { Module } from "@nestjs/common";
import { BatchService } from "./batch.service";
import { BatchController } from "./batch.controller";
import { InventoryModule } from "src/inventory/inventory.module";
import { StockAlertModule } from "src/stockalert/stockalert.module"; 

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