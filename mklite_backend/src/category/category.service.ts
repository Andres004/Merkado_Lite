import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from 'src/entity/category.entity';
import { AppDataSource } from 'src/data-source'; 

@Injectable()
export class CategoryService {
    private categoryRepository: Repository<Category>;

    constructor() {
        // Sigue el patrón de AppDataSource
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.categoryRepository = AppDataSource.getRepository(Category);
    }

    async createCategory(category: Category): Promise<Category> {
        return await this.categoryRepository.save(category);
    }

    async getAllCategories(): Promise<Category[]> {
        return await this.categoryRepository.find();
    }

    async getCategoryById(id_categoria: number): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id_categoria });
        if (!category) {
            throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada`);
        }
        return category;
    }

    async updateCategory(id_categoria: number, updateData: Partial<Category>): Promise<Category> {
        const updateResult = await this.categoryRepository.update(id_categoria, updateData);
        
        if (updateResult.affected === 0) {
            throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada para actualizar`);
        }
        return this.getCategoryById(id_categoria);
    }

    async deleteCategory(id_categoria: number): Promise<{ message: string }> {
        const deleteResult = await this.categoryRepository.delete(id_categoria);
        
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada para eliminar`);
        }
        return { message: `Categoría con ID ${id_categoria} eliminada con éxito` };
    }
}