import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CartItem } from 'src/entity/cartitem.entity';
import { Product } from 'src/entity/product.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class CartItemService {
  private cartItemRepository: Repository<CartItem>;

  constructor() {
    this.cartItemRepository = AppDataSource.getRepository(CartItem);
  }

  async createCartItem(cartItem: CartItem): Promise<CartItem> {
    return await this.cartItemRepository.save(cartItem);
  }

  async getAllCartItems(): Promise<CartItem[]> {
    return await this.cartItemRepository.find();
  }

  async getCartItemByIds(id_carrito: number, id_producto: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOneBy({ id_carrito, id_producto });
    if (!cartItem) {
      throw new NotFoundException(`Item en carrito con id_carrito=${id_carrito} y id_producto=${id_producto} no encontrado`);
    }
    return cartItem;
  }

  async updateCartItem(id_carrito: number, id_producto: number, updateData: Partial<CartItem>): Promise<CartItem> {
    const updateResult = await this.cartItemRepository.update({ id_carrito, id_producto }, updateData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Item en carrito con id_carrito=${id_carrito} y id_producto=${id_producto} no encontrado para actualizar`);
    }
    return this.getCartItemByIds(id_carrito, id_producto);
  }

  async deleteCartItem(id_carrito: number, id_producto: number): Promise<{ message: string }> {
    const deleteResult = await this.cartItemRepository.delete({ id_carrito, id_producto });
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Item en carrito con id_carrito=${id_carrito} y id_producto=${id_producto} no encontrado para eliminar`);
    }
    return { message: `Item en carrito eliminado con id_carrito=${id_carrito} y id_producto=${id_producto}` };
  }

  // Nueva función para agregar producto al carrito o actualizar cantidad
  async addProductToCart(
    id_carrito: number,
    product: Product,
    cantidad: number,
    precio_unitario: number,
  ): Promise<CartItem> {
    const existingItem = await this.cartItemRepository.findOneBy({ id_carrito, id_producto: product.id_producto });

    if (existingItem) {
      existingItem.cantidad += cantidad;
      existingItem.precio_unitario = precio_unitario; // actualizar precio
      return await this.cartItemRepository.save(existingItem);
    } else {
      const newCartItem = this.cartItemRepository.create({
        id_carrito,
        id_producto: product.id_producto,
        cantidad,
        precio_unitario,
        product,
      });
      return await this.cartItemRepository.save(newCartItem);
    }
  }
}
