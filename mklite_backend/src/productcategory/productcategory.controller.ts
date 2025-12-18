import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ProductCategoryService } from './productcategory.service';

// DTO simple para la creación
class CreateProductCategoryDto {
    id_producto: number;
    id_categoria: number;
}

@Controller('productcategory')
export class ProductCategoryController {
    constructor(private readonly pcService: ProductCategoryService) {}

    
    //Asignar una categoría a un producto
    
    @Post()
    async assignCategory(@Body() dto: CreateProductCategoryDto) {
        return this.pcService.assignCategoryToProduct(dto);
    }

    
    //Obtener todas las asignaciones
    
    @Get()
    async getAllAssignments() {
        return this.pcService.getAllAssignments();
    }

    
    //Obtener las categorías de un producto específico
    
    @Get('/product/:id_producto')
    async getCategoriesForProduct(@Param('id_producto', ParseIntPipe) id_producto: number) {
        return this.pcService.getCategoriesForProduct(id_producto);
    }

    
    //Obtener los productos de una categoría específica
    
    @Get('/category/:id_categoria')
    async getProductsForCategory(@Param('id_categoria', ParseIntPipe) id_categoria: number) {
        return this.pcService.getProductsForCategory(id_categoria);
    }

    
    //Quitar una categoría a un producto
    
    @Delete('/:id_producto/:id_categoria')
    async removeCategory(
        @Param('id_producto', ParseIntPipe) id_producto: number,
        @Param('id_categoria', ParseIntPipe) id_categoria: number
    ) {
        return this.pcService.removeCategoryFromProduct(id_producto, id_categoria);
    }
}