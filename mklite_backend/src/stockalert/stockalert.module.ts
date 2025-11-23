import { Module } from "@nestjs/common";
import { StockAlertService } from "./stockalert.service";
import { StockAlertController } from "./stockalert.controller";

@Module({
    imports: [],
    controllers: [StockAlertController],
    providers: [StockAlertService],
    exports: [StockAlertService],
})
export class StockAlertModule {}