import { Module } from "@nestjs/common";
import { ProductCategoryService } from "./productcategory.service";
import { ProductCategoryController } from "./productcategory.controller";

@Module({
    imports: [],
    controllers: [ProductCategoryController],
    providers: [ProductCategoryService],
<<<<<<< HEAD
=======
    exports: [ProductCategoryService],
>>>>>>> Backend-andy
})
export class ProductCategoryModule {}