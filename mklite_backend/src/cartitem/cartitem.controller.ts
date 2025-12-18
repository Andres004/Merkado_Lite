import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
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

  // Agregar producto al carrito (Lógica principal de compra)
  @Post('/add')
  async addProductToCart(@Body() body: { id_usuario: number; id_producto: number; cantidad: number }) {
    // 1. Obtener o crear carrito activo
    const cart = await this.cartService.findOrCreateActiveCart(body.id_usuario);

    // 2. Obtener producto
    const productWithPricing = await this.productService.getProductPricing(body.id_producto);

    // 3. Agregar (El servicio valida el stock)
    return await this.cartItemService.addProductToCart(
      cart.id_carrito,
      productWithPricing,
      body.cantidad,
      productWithPricing.finalPrice ?? productWithPricing.precio_venta,
    );
  }


  @Get()
  async getAllCartItems() {
    return await this.cartItemService.getAllCartItems();
  }

  @Put('/:id_carrito/:id_producto')
  async updateCartItem(
    @Param('id_carrito', ParseIntPipe) id_carrito: number,
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @Body() updateData: { cantidad: number },
  ) {
    return await this.cartItemService.updateCartItem(id_carrito, id_producto, updateData);
  }

  @Delete('/:id_carrito/:id_producto')
  async deleteCartItem(
    @Param('id_carrito', ParseIntPipe) id_carrito: number,
    @Param('id_producto', ParseIntPipe) id_producto: number,
  ) {
    return await this.cartItemService.deleteCartItem(id_carrito, id_producto);
  }
}