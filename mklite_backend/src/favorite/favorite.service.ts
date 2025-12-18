import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Favorite } from '../entity/favorite.entity';
import { Product } from '../entity/product.entity';
import { AppDataSource } from '../data-source';

@Injectable()
export class FavoriteService {
  private favoriteRepository: Repository<Favorite>;
  private productRepository: Repository<Product>;

  constructor() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }

    this.favoriteRepository = AppDataSource.getRepository(Favorite);
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { id_usuario: userId },
      relations: ['product', 'product.inventory'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async addFavorite(userId: number, productId: number): Promise<Favorite> {
    const product = await this.productRepository.findOne({
      where: { id_producto: productId },
      relations: ['inventory'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
    }

    const existing = await this.favoriteRepository.findOne({
      where: { id_usuario: userId, id_producto: productId },
      relations: ['product', 'product.inventory'],
    });

    if (existing) {
      return existing;
    }

    const favorite = this.favoriteRepository.create({
      id_usuario: userId,
      id_producto: productId,
      product,
    });

    await this.favoriteRepository.save(favorite);
    return this.favoriteRepository.findOneOrFail({
      where: { id_favorito: favorite.id_favorito },
      relations: ['product', 'product.inventory'],
    });
  }

  async removeFavorite(userId: number, productId: number): Promise<{ message: string }> {
    const result = await this.favoriteRepository.delete({
      id_usuario: userId,
      id_producto: productId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('El producto no está en tus favoritos.');
    }

    return { message: 'Producto eliminado de favoritos.' };
  }
}