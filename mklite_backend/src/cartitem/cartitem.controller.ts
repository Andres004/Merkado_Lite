import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CartItem } from 'src/entity/cartitem.entity';
import { CartItemService } from './cartitem.service';
import { ProductService } from '../product/product.service';
import { CartService } from '../cart/cart.service';

@Controller('cartitem')
export class CartItemController {
  constructor(
    private readonly cartItemService: CartItemService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  async createCartItem(@Body() cartItem: CartItem) {
    return await this.cartItemService.createCartItem(cartItem);
  }

  @Get()
  async getAllCartItems() {
    return await this.cartItemService.getAllCartItems();
  }

  @Get('/:id_carrito/:id_producto')
  async getCartItemByIds(
    @Param('id_carrito') id_carrito: string,
    @Param('id_producto') id_producto: string,
  ) {
    return await this.cartItemService.getCartItemByIds(Number(id_carrito), Number(id_producto));
  }

  @Put('/:id_carrito/:id_producto')
  async updateCartItem(
    @Param('id_carrito') id_carrito: string,
    @Param('id_producto') id_producto: string,
    @Body() updateData: Partial<CartItem>,
  ) {
    return await this.cartItemService.updateCartItem(Number(id_carrito), Number(id_producto), updateData);
  }

  @Delete('/:id_carrito/:id_producto')
  async deleteCartItem(
    @Param('id_carrito') id_carrito: string,
    @Param('id_producto') id_producto: string,
  ) {
    return await this.cartItemService.deleteCartItem(Number(id_carrito), Number(id_producto));
  }

// Nuevo endpoint para agregar producto al carrito (usa o crea carrito activo)
  @Post('/add')
  async addProductToCart(@Body() body: { id_usuario: number; id_producto: number; cantidad: number }) {
    // Primero obtener carrito activo o crear uno para el usuario
    // USAR LA PROPIEDAD INYECTADA: this.cartService
    const cart = await this.cartService.findOrCreateActiveCart(body.id_usuario); 

    // Obtener producto para precio y validaciones
    const product = await this.productService.getProductById(body.id_producto);

    return await this.cartItemService.addProductToCart(cart.id_carrito, product, body.cantidad, product.precio_venta);
  }
}
