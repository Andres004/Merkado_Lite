import { Module } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";

@Module({
    imports: [],
    controllers: [SupplierController],
    providers: [SupplierService],
    exports: [SupplierService], 
})
export class SupplierModule {}