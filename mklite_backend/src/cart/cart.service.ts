import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from 'src/entity/cart.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class CartService {
  private cartRepository: Repository<Cart>;

  constructor() {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.cartRepository = AppDataSource.getRepository(Cart);
  }

  async createCart(cart: Cart): Promise<Cart> {
    return await this.cartRepository.save(cart);
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.find({ relations: ['user', 'cartItems'] });
  }

  // --- AQUÍ ESTÁ LA MAGIA QUE TE FALTA ---
  async getCartById(id_carrito: number): Promise<any> { // Retorna any para poder añadir campos extra
    const cart = await this.cartRepository.findOne({
      where: { id_carrito },
      relations: ['user', 'cartItems', 'cartItems.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado`);
    }

    // Calculamos la suma: (Precio * Cantidad) de cada item
    const totalCalculado = cart.cartItems.reduce((acc, item) => {
        return acc + (Number(item.precio_unitario) * item.cantidad);
    }, 0);

    // Devolvemos el objeto carrito mezclado con el nuevo campo
    return {
        ...cart,
        totalEstimado: totalCalculado 
    };
  }

  async updateCart(id_carrito: number, updateData: Partial<Cart>): Promise<any> {
    const updateResult = await this.cartRepository.update(id_carrito, updateData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado para actualizar`);
    }
    // Llamamos a getCartById para que devuelva el objeto actualizado CON el total
    return this.getCartById(id_carrito);
  }

  async deleteCart(id_carrito: number): Promise<{ message: string }> {
    const deleteResult = await this.cartRepository.delete(id_carrito);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Carrito con ID ${id_carrito} no encontrado para eliminar`);
    }
    return { message: `Carrito con ID ${id_carrito} eliminado correctamente` };
  }

  async createCartForUser(id_usuario: number): Promise<Cart> {
    const newCart = this.cartRepository.create({
        id_usuario,
        fecha_creacion: new Date(),
        estado: true,
        descuento_aplicado: false
    });
    return await this.cartRepository.save(newCart);
  }

  async getCartsByUserId(id_usuario: number): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { id_usuario },
      relations: ['cartItems', 'cartItems.product'],
    });
  }

  // También añadimos el cálculo aquí por si acaso lo necesitas al agregar productos
  async findOrCreateActiveCart(id_usuario: number): Promise<any> {
    let cart = await this.cartRepository.findOne({
      where: { id_usuario, estado: true },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      cart = await this.createCartForUser(id_usuario);
      // Si es nuevo, no tiene items, total es 0
      return { ...cart, totalEstimado: 0 };
    }

    // Si ya existe, calculamos el total
    const totalCalculado = cart.cartItems ? cart.cartItems.reduce((acc, item) => {
        return acc + (Number(item.precio_unitario) * item.cantidad);
    }, 0) : 0;

    return { ...cart, totalEstimado: totalCalculado };
  }
}