import { Injectable, NotFoundException } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Product } from 'src/entity/product.entity';
import { AppDataSource } from 'src/data-source';

type DiscountType = 'PERCENT' | 'FIXED';

const OFFERS_MAP: Record<number, { type: DiscountType; value: number }> = {
    // Mapa mock para usar en caso de no encontrar descuentos activos en BD
    1: { type: 'PERCENT', value: 10 },
    2: { type: 'PERCENT', value: 15 },
    3: { type: 'FIXED', value: 5 },
};


@Injectable()
export class ProductService {
    private productRepository: Repository<Product>;

    constructor() {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.productRepository = AppDataSource.getRepository(Product);
    }

     private isActiveDiscount(discount: any, now: Date) {
        if (!discount) return false;
        const hasValue = discount.porcentaje_descuento != null || discount.monto_fijo != null;
        return hasValue && discount.estado_de_oferta && discount.fecha_inicio <= now && discount.fecha_final >= now;
    }

    private calculatePricing(product: Product) {
        const now = new Date();
        const basePrice = Number(product.precio_venta);
        let discountType: DiscountType | null = null;
        let discountValue = 0;

        const candidates = (product.discountProducts || [])
            .map((dp) => dp.discount)
            .filter((discount) => this.isActiveDiscount(discount, now));

        if (candidates.length > 0) {
            // Seleccionamos el descuento que deje el menor precio final
            candidates.forEach((discount) => {
                if (discount.porcentaje_descuento != null) {
                    const final = basePrice * (1 - Number(discount.porcentaje_descuento) / 100);
                    if (!discountType || final < basePrice * (1 - discountValue / 100)) {
                        discountType = 'PERCENT';
                        discountValue = Number(discount.porcentaje_descuento);
                    }
                } else if (discount.monto_fijo != null) {
                    const final = basePrice - Number(discount.monto_fijo);
                    if (!discountType || final < basePrice - discountValue) {
                        discountType = 'FIXED';
                        discountValue = Number(discount.monto_fijo);
                    }
                }
            });
        }

        if (!discountType) {
            const mockOffer = OFFERS_MAP[product.id_producto];
            if (mockOffer) {
                discountType = mockOffer.type;
                discountValue = mockOffer.value;
            }
        }

        let finalPrice = basePrice;
        if (discountType === 'PERCENT') {
            finalPrice = Number((basePrice * (1 - discountValue / 100)).toFixed(2));
        } else if (discountType === 'FIXED') {
            finalPrice = Number(Math.max(basePrice - discountValue, 0).toFixed(2));
        }

        return {
            hasDiscount: !!discountType,
            discountType,
            discountValue,
            discountPercent: discountType === 'PERCENT' ? discountValue : undefined,
            discountAmount: discountType === 'FIXED' ? discountValue : undefined,
            originalPrice: basePrice,
            finalPrice,
        };
    }

    async getProductPricing(id_producto: number, product?: Product) {
        const productEntity = product ?? (await this.getProductById(id_producto));
        const pricing = this.calculatePricing(productEntity);

        return {
            ...productEntity,
            ...pricing,
        };
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

    async getOfferProducts() {
        const productsWithDiscounts = await this.getProductsWithActiveDiscounts();
        const sourceProducts = productsWithDiscounts.length > 0 ? productsWithDiscounts : await this.getAllProducts();

        return sourceProducts
            .map((product) => ({
                ...product,
                ...this.calculatePricing(product),
            }))
            .filter((product) => product.hasDiscount);
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