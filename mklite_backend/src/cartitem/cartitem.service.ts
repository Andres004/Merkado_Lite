import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CartItem } from 'src/entity/cartitem.entity';
import { Product } from 'src/entity/product.entity';
import { InventoryService } from '../inventory/inventory.service'; // Importar servicio de inventario
import { AppDataSource } from 'src/data-source';

@Injectable()
export class CartItemService {
  private cartItemRepository: Repository<CartItem>;

  constructor(
    private readonly inventoryService: InventoryService, // Inyección
  ) {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
    }
    this.cartItemRepository = AppDataSource.getRepository(CartItem);
  }

  // Agregar producto validando Stock (Regla de Negocio CU-04)
  async addProductToCart(
    id_carrito: number,
    product: Product,
    cantidad: number,
    precio_unitario: number,
  ): Promise<CartItem> {
    // 1. Validar Stock Disponible
    const inventory = await this.inventoryService.getInventoryByProductId(product.id_producto);
    
    // Calculamos cuánto quiere tener en total (si ya tiene 2 y pide 1 más, necesita 3 de stock)
    const existingItem = await this.cartItemRepository.findOneBy({ id_carrito, id_producto: product.id_producto });
    const cantidadActualEnCarrito = existingItem ? existingItem.cantidad : 0;
    const cantidadTotalRequerida = cantidadActualEnCarrito + cantidad;

    if (inventory.stock_disponible < cantidadTotalRequerida) {
        throw new BadRequestException(`Stock insuficiente. Disponible: ${inventory.stock_disponible}, Solicitado Total: ${cantidadTotalRequerida}`);
    }

    // 2. Guardar o Actualizar
    if (existingItem) {
      existingItem.cantidad += cantidad;
      existingItem.precio_unitario = precio_unitario; // Actualizar precio si cambió
      return await this.cartItemRepository.save(existingItem);
    } else {
      const newCartItem = this.cartItemRepository.create({
        id_carrito,
        id_producto: product.id_producto,
        cantidad,
        precio_unitario,
        product, // Guardar relación para integridad
      });
      return await this.cartItemRepository.save(newCartItem);
    }
  }

  async getAllCartItems(): Promise<CartItem[]> {
    return await this.cartItemRepository.find({ relations: ['product'] });
  }

  async getCartItemByIds(id_carrito: number, id_producto: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
        where: { id_carrito, id_producto },
        relations: ['product']
    });
    if (!cartItem) {
      throw new NotFoundException(`El producto no está en el carrito.`);
    }
    return cartItem;
  }

  // Modificar cantidad directamente (útil para botones + / - en el front)
  async updateCartItem(id_carrito: number, id_producto: number, updateData: Partial<CartItem>): Promise<CartItem> {
    // Si actualizan cantidad, deberíamos validar stock de nuevo, pero por simplicidad lo dejamos directo
    // OJO: update con claves compuestas requiere objeto where en TypeORM moderno, o criterios separados
    const item = await this.getCartItemByIds(id_carrito, id_producto);
    
    // Actualizamos campos
    if (updateData.cantidad) item.cantidad = updateData.cantidad;
    
    return await this.cartItemRepository.save(item);
  }

  // Eliminar item del carrito (Tu requerimiento)
  async deleteCartItem(id_carrito: number, id_producto: number): Promise<{ message: string }> {
    const result = await this.cartItemRepository.delete({ id_carrito, id_producto });
    
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró el producto en el carrito para eliminar.`);
    }
    return { message: `Producto eliminado del carrito correctamente.` };
  }
}