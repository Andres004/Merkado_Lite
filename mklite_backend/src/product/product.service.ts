import { Injectable, NotFoundException } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/entity/product.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class ProductService {
    private productRepository: Repository<Product>;

    constructor() {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.productRepository = AppDataSource.getRepository(Product);
    }

    async createProduct(product: Product): Promise<Product> {
        return await this.productRepository.save(product);
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: [
                'productCategories',
                'productCategories.categoria',
                'inventory', // <--- IMPORTANTE: Para ver el stock
                'discountProducts',
                'discountProducts.discount'
            ],
        });
    }

    // Método para buscar productos por nombre o descripción
    async searchProducts(query: string): Promise<Product[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const normalizedQuery = `%${query.trim()}%`;

        return this.productRepository.find({
            where: [
                { nombre: Like(normalizedQuery) },
                { descripcion: Like(normalizedQuery) }
            ],
            relations: [
                'productCategories',
                'productCategories.categoria',
                'inventory', // <--- IMPORTANTE: Para ver el stock en la búsqueda
                'discountProducts',
                'discountProducts.discount'
            ],
        });
    }

    // Método para obtener productos con descuentos activos
    async getProductsWithActiveDiscounts(): Promise<Product[]> {
        const now = new Date();
        
        return await this.productRepository.createQueryBuilder('product')
            .innerJoinAndSelect('product.discountProducts', 'dp')
            .innerJoinAndSelect('dp.discount', 'd')
            .leftJoinAndSelect('product.productCategories', 'pc')
            .leftJoinAndSelect('pc.categoria', 'c')
            .leftJoinAndSelect('product.inventory', 'inv')
            .where('d.estado_de_oferta = :active', { active: true })
            .andWhere('d.fecha_inicio <= :now', { now })
            .andWhere('d.fecha_final >= :now', { now })
            .getMany();
    }

    async getProductById(id_producto: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id_producto },
            relations: [
                'productCategories',
                'productCategories.categoria',
                'inventory', // <--- IMPORTANTE: Para ver el stock en el detalle
                'discountProducts',
                'discountProducts.discount'
            ],
        });
        
        if (!product) {
            throw new NotFoundException(`Producto con ID ${id_producto} no encontrado`);
        }
        return product;
    }

    async updateProduct(id_producto: number, updateData: Partial<Product>): Promise<Product> {
        const updateResult = await this.productRepository.update(id_producto, updateData);
        if (updateResult.affected === 0) {
            throw new NotFoundException(`Producto con ID ${id_producto} no encontrado para actualizar`);
        }
        return this.getProductById(id_producto); 
    }

    async deleteProduct(id_producto: number): Promise<{ message: string }> {
        const deleteResult = await this.productRepository.delete(id_producto);
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Producto con ID ${id_producto} no encontrado para eliminar`);
        }
        return { message: `Producto con ID ${id_producto} eliminado con éxito` };
    }
}