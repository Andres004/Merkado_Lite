import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Supplier } from 'src/entity/supplier.entity';
import { AppDataSource } from 'src/data-source';

@Injectable()
export class SupplierService {
  private supplierRepository: Repository<Supplier>;

  constructor() {
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

  async updateSupplier(id_proveedor: number, data: Partial<Supplier>): Promise<Supplier> {
    const result = await this.supplierRepository.update(id_proveedor, data);

    if (result.affected === 0) {
      throw new NotFoundException(`Proveedor con ID ${id_proveedor} no encontrado para actualizar`);
    }

    return this.getSupplierById(id_proveedor);
  }

  async deleteSupplier(id_proveedor: number): Promise<{ message: string }> {
    const result = await this.supplierRepository.delete(id_proveedor);

    if (result.affected === 0) {
      throw new NotFoundException(`Proveedor con ID ${id_proveedor} no encontrado para eliminar`);
    }

    return { message: 'Proveedor eliminado correctamente' };
  }
}
