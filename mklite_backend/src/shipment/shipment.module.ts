import { Module } from "@nestjs/common";
import { ShipmentService } from "./shipment.service";
import { ShipmentController } from "./shipment.controller";
import { OrderModule } from "../order/order.module"; // Asegúrate de que la ruta sea correcta

@Module({
    imports: [OrderModule], 
    controllers: [ShipmentController],
    providers: [ShipmentService],
})
export class ShipmentModule {}