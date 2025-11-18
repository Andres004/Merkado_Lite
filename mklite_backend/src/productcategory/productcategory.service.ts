import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; // Ajuste la ruta
import { ProductCategory } from "src/entity/productcategory.entity"; // Ajuste la ruta
import { Repository } from "typeorm";

@Injectable()
export class ProductCategoryService {
    private pcRepository: Repository<ProductCategory>;

    private getRepository(): Repository<ProductCategory> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.pcRepository) {
            this.pcRepository = AppDataSource.getRepository(ProductCategory);
        }
        return this.pcRepository;
    }

    
    //Asigna una categoría a un producto
    
    async assignCategoryToProduct(dto: { id_producto: number, id_categoria: number }) {
        const { id_producto, id_categoria } = dto;

        const existing = await this.getRepository().findOneBy({ id_producto, id_categoria });
        if (existing) {
            throw new ConflictException(`El producto ${id_producto} ya tiene la categoría ${id_categoria}`);
        }

        const assignment = this.getRepository().create(dto);
        return await this.getRepository().save(assignment);
    }

    
    //Obtiene todas las asignaciones
    
    async getAllAssignments() {
        return await this.getRepository().find({ relations: ['producto', 'categoria'] });
    }

    
    //Obtiene todas las categorías para un producto específico
      
    async getCategoriesForProduct(id_producto: number): Promise<ProductCategory[]> {
        const assignments = await this.getRepository().find({
            where: { id_producto },
            relations: ['categoria'],
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron categorías para el producto ${id_producto}`);
        }
        return assignments;
    }

    //Obtiene todos los productos para una categoría específica
    
    async getProductsForCategory(id_categoria: number): Promise<ProductCategory[]> {
        const assignments = await this.getRepository().find({
            where: { id_categoria },
            relations: ['producto'],
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron productos para la categoría ${id_categoria}`);
        }
        return assignments;
    }

    
    //Elimina una asignación de categoría de un producto
    
    async removeCategoryFromProduct(id_producto: number, id_categoria: number) {
        const result = await this.getRepository().delete({ id_producto, id_categoria });

        if (result.affected === 0) {
            throw new NotFoundException(`Asignación no encontrada para producto ${id_producto} y categoría ${id_categoria}`);
        }
        return { message: `Categoría ${id_categoria} eliminada del producto ${id_producto} con éxito` };
    }
}