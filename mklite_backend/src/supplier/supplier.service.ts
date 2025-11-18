import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Supplier } from 'src/entity/supplier.entity'; // Ajusta la ruta
import { AppDataSource } from 'src/data-source';

@Injectable()
export class SupplierService {
    private supplierRepository: Repository<Supplier>;

    constructor() {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        this.supplierRepository = AppDataSource.getRepository(Supplier);
    }

    async createSupplier(supplier: Supplier): Promise<Supplier> {
        return await this.supplierRepository.save(supplier);
    }

    async getAllSuppliers(): Promise<Supplier[]> {
        return await this.supplierRepository.find();
    }

    async getSupplierById(id_proveedor: number): Promise<Supplier> {
        const supplier = await this.supplierRepository.findOneBy({ id_proveedor });
        if (!supplier) {
            throw new NotFoundException(`Proveedor con ID ${id_proveedor} no encontrado`);
        }
        return supplier;
    }

    async updateSupplier(id_proveedor: number, updateData: Partial<Supplier>): Promise<Supplier> {
        const updateResult = await this.supplierRepository.update(id_proveedor, updateData);
        
        if (updateResult.affected === 0) {
            throw new NotFoundException(`Proveedor con ID ${id_proveedor} no encontrado para actualizar`);
        }
        return this.getSupplierById(id_proveedor);
    }

    async deleteSupplier(id_proveedor: number): Promise<{ message: string }> {
        const deleteResult = await this.supplierRepository.delete(id_proveedor);
        
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Proveedor con ID ${id_proveedor} no encontrado para eliminar`);
        }
        return { message: `Proveedor con ID ${id_proveedor} eliminado con éxito` };
    }
}
