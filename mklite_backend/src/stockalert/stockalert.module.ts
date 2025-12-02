import { Module } from "@nestjs/common";
import { StockAlertService } from "./stockalert.service";
import { StockAlertController } from "./stockalert.controller";

@Module({
    imports: [],
    controllers: [StockAlertController],
    providers: [StockAlertService],
    exports: [StockAlertService],
})
<<<<<<< HEAD
export class StockAlertModule {}
=======
export class StockAlertModule {}
>>>>>>> Backend-andy
