import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { Cart } from 'src/entity/cart.entity';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async createCart(@Body() cart: Cart) {
    return await this.cartService.createCart(cart);
  }

  @Get()
  async getAllCarts() {
    return await this.cartService.getAllCarts();
  }

  @Get('/:id_carrito')
  async getCartById(@Param('id_carrito', ParseIntPipe) id_carrito: number) {
    return await this.cartService.getCartById(id_carrito);
  }

  @Put('/:id_carrito')
  async updateCart(@Param('id_carrito', ParseIntPipe) id_carrito: number, @Body() updateData: Partial<Cart>) {
    return await this.cartService.updateCart(id_carrito, updateData);
  }

  @Delete('/:id_carrito')
  async deleteCart(@Param('id_carrito', ParseIntPipe) id_carrito: number) {
    return await this.cartService.deleteCart(id_carrito);
  }

  @Get('/user/:id_usuario')
  async getCartsByUserId(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
    return await this.cartService.getCartsByUserId(id_usuario);
  }
}