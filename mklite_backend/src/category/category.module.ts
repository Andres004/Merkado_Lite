import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";

@Module({
    imports: [],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService], 
})
<<<<<<< HEAD
export class CategoryModule {}
=======
export class CategoryModule {}
>>>>>>> Backend-andy
