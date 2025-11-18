import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Category } from "src/entity/category.entity"; // Ajuste la ruta
import { CategoryService } from "./category.service";

@Controller('/category')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    async createCategory(@Body() category: Category) {
        return await this.categoryService.createCategory(category);
    }

    @Get()
    async getAllCategories() {
        return await this.categoryService.getAllCategories();
    }

    @Get('/:id_categoria') 
    async getCategoryById(@Param('id_categoria') id_categoria: string) {
        return await this.categoryService.getCategoryById(Number(id_categoria));
    }

    @Delete('/:id_categoria')
    async deleteCategory(@Param('id_categoria') id_categoria: string) {
        return await this.categoryService.deleteCategory(Number(id_categoria));
    }

    @Put('/:id_categoria')
    async updateCategory(@Param('id_categoria') id_categoria: string, @Body() category: Category) {
        return await this.categoryService.updateCategory(Number(id_categoria), category);
    }
}