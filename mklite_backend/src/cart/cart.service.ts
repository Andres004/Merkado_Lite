import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from 'src/entity/cart.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class CartService {
  private cartRepository: Repository<Cart>;

  constructor() {
    this.cartRepository = AppDataSource.getRepository(Cart);
  }

  async createCart(cart: Cart): Promise<Cart> {
    return await this.cartRepository.save(cart);
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.find({ relations: ['user', 'cartItems'] });
  }

  async getCartById(id_carrito: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id_carrito },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });
    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado`);
    }
    return cart;
  }

  async updateCart(id_carrito: number, updateData: Partial<Cart>): Promise<Cart> {
    const updateResult = await this.cartRepository.update(id_carrito, updateData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado para actualizar`);
    }
    return this.getCartById(id_carrito);
  }

  async deleteCart(id_carrito: number): Promise<{ message: string }> {
    const deleteResult = await this.cartRepository.delete(id_carrito);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado para eliminar`);
    }
    return { message: `Carrito con ID ${id_carrito} eliminado correctamente` };
  }

  // Crear un carrito nuevo para un usuario
  async createCartForUser(id_usuario: number): Promise<Cart> {
    const newCart = new Cart();
    newCart.id_usuario = id_usuario;
    newCart.fecha_creacion = new Date();
    newCart.estado = true;
    newCart.descuento_aplicado = false;
    return await this.cartRepository.save(newCart);
  }

  // Obtener todos los carritos de un usuario con items y productos cargados
  async getCartsByUserId(id_usuario: number): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { id_usuario },
      relations: ['cartItems', 'cartItems.product'],
    });
  }

  // Buscar carrito activo de usuario, si no existe crear uno
  async findOrCreateActiveCart(id_usuario: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { id_usuario, estado: true },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      cart = await this.createCartForUser(id_usuario);
    }
    return cart;
  }
}
