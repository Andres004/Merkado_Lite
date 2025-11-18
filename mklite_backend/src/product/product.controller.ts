import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Product } from "src/entity/product.entity";
import { ProductService } from "./product.service";

@Controller('/product')
export class ProductController {

  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() product: Product) {
    return await this.productService.createProduct(product);
  }

  @Get()
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @Get('/:id_producto') 
  async getProductById(@Param('id_producto') id_producto: string) {
    return await this.productService.getProductById(Number(id_producto));
  }

  @Delete('/:id_producto')
  async deleteProduct(@Param('id_producto') id_producto: string) {
    return await this.productService.deleteProduct(Number(id_producto));
  }

  @Put('/:id_producto')
  async updateProduct(@Param('id_producto') id_producto: string,  @Body() product: Product) {
    return await this.productService.updateProduct(Number(id_producto), product);
  }
}