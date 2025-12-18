import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Discount, DiscountScope } from 'src/entity/discount.entity';
import { AppDataSource } from 'src/data-source';
import { DiscountProduct } from 'src/entity/discountproduct.entity';
import { DiscountCategory } from '../entity/discountcategory.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
  private discountRepository: Repository<Discount>;
  private discountProductRepository: Repository<DiscountProduct>;
  private discountCategoryRepository: Repository<DiscountCategory>;

  constructor() {
    this.initRepositories();
  }

  // Patrón idéntico a UserService
  private initRepositories() {
    if (AppDataSource.isInitialized) {
      this.discountRepository = AppDataSource.getRepository(Discount);
      this.discountProductRepository = AppDataSource.getRepository(DiscountProduct);
      this.discountCategoryRepository = AppDataSource.getRepository(DiscountCategory);
    }
  }

  private ensureDataSource() {
    if (!this.discountRepository || !this.discountProductRepository || !this.discountCategoryRepository) this.initRepositories();
    if (!this.discountRepository || !this.discountProductRepository || !this.discountCategoryRepository)
      throw new Error('DataSource no está inicializado');
  }

  private async mapDiscountWithRelations(discount: Discount) {
    const productos = discount.discountProducts?.map((dp) => ({
      id_producto: dp.id_producto,
      nombre: dp.product?.nombre,
    }));

    const categorias = discount.discountCategories?.map((dc) => ({
      id_categoria: dc.id_categoria,
      nombre: dc.category?.nombre,
    }));

    return { ...discount, productos, categorias };
  }

  private validateDates(fecha_inicio: Date, fecha_final: Date) {
    if (fecha_inicio >= fecha_final) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha final');
    }
  }

  private validateTargets(aplica_a: DiscountScope, target_ids?: number[]) {
    if (aplica_a !== 'ALL') {
      if (!target_ids || target_ids.length === 0) {
        throw new BadRequestException('Debe especificar los IDs de destino para el descuento');
      }
    }
  }

  private validateAmounts(porcentaje_descuento?: number, monto_fijo?: number) {
    if (porcentaje_descuento == null && monto_fijo == null) {
      throw new BadRequestException('Debe especificar porcentaje o monto fijo para el descuento');
    }
  }

  async createDiscount(discountDto: CreateDiscountDto): Promise<Discount> {
    this.ensureDataSource();
    const fecha_inicio = new Date(discountDto.fecha_inicio);
    const fecha_final = new Date(discountDto.fecha_final);

    this.validateDates(fecha_inicio, fecha_final);
    this.validateTargets(discountDto.aplica_a, discountDto.target_ids);
    this.validateAmounts(discountDto.porcentaje_descuento, discountDto.monto_fijo);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const discount = queryRunner.manager.create(Discount, {
        ...discountDto,
        fecha_inicio,
        fecha_final,
      });

      const saved = await queryRunner.manager.save(discount);

      await this.persistTargets(queryRunner.manager.getRepository(DiscountProduct), queryRunner.manager.getRepository(DiscountCategory), saved.id_descuento, discountDto.aplica_a, discountDto.target_ids);

      await queryRunner.commitTransaction();
      return await this.getDiscountById(saved.id_descuento);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllDiscounts(): Promise<Discount[]> {
    this.ensureDataSource();
    const discounts = await this.discountRepository.find({
      relations: ['discountProducts', 'discountProducts.product', 'discountCategories', 'discountCategories.category'],
      order: { fecha_inicio: 'DESC' },
    });

    return discounts.map((d) => ({
      ...d,
      productos: d.discountProducts?.map((dp) => ({ id_producto: dp.id_producto, nombre: dp.product?.nombre })),
      categorias: d.discountCategories?.map((dc) => ({ id_categoria: dc.id_categoria, nombre: dc.category?.nombre })),
    })) as any;
  }

  async getDiscountById(id_descuento: number): Promise<Discount> {
    this.ensureDataSource();
    const discount = await this.discountRepository.findOne({
      where: { id_descuento },
      relations: ['discountProducts', 'discountProducts.product', 'discountCategories', 'discountCategories.category'],
    });
    if (!discount) {
      throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado`);
    }
    return await this.mapDiscountWithRelations(discount);
  }

  async getDiscountByCode(code: string): Promise<Discount> {
    this.ensureDataSource();
    const discount = await this.discountRepository.findOne({
      where: { codigo_cupon: code, estado_de_oferta: true },
      relations: ['discountProducts', 'discountProducts.product', 'discountCategories', 'discountCategories.category'],
    });

    if (!discount) throw new NotFoundException('Cupón inválido o no encontrado');

    const now = new Date();
    if (now < discount.fecha_inicio || now > discount.fecha_final) {
      throw new BadRequestException('El cupón ha expirado o aún no es válido');
    }

    return await this.mapDiscountWithRelations(discount);
  }

  async updateDiscount(id_descuento: number, updateData: UpdateDiscountDto): Promise<Discount> {
    this.ensureDataSource();
    const existing = await this.discountRepository.findOne({ where: { id_descuento } });
    if (!existing) {
      throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para actualizar`);
    }

    const newFechaInicio = updateData.fecha_inicio ? new Date(updateData.fecha_inicio) : existing.fecha_inicio;
    const newFechaFinal = updateData.fecha_final ? new Date(updateData.fecha_final) : existing.fecha_final;
    this.validateDates(newFechaInicio, newFechaFinal);

    const newScope = updateData.aplica_a ?? existing.aplica_a;
    const shouldUpdateTargets = updateData.target_ids !== undefined || updateData.aplica_a !== undefined;
    if (shouldUpdateTargets) {
      this.validateTargets(newScope, newScope === 'ALL' ? [] : updateData.target_ids ?? []);
    }

    const newPorcentaje = updateData.porcentaje_descuento ?? existing.porcentaje_descuento;
    const newMontoFijo = updateData.monto_fijo ?? existing.monto_fijo;
    this.validateAmounts(newPorcentaje, newMontoFijo);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Discount, id_descuento, {
        ...updateData,
        fecha_inicio: newFechaInicio,
        fecha_final: newFechaFinal,
        aplica_a: newScope,
      });

      if (shouldUpdateTargets) {
        await queryRunner.manager.delete(DiscountProduct, { id_descuento });
        await queryRunner.manager.delete(DiscountCategory, { id_descuento });
        await this.persistTargets(
          queryRunner.manager.getRepository(DiscountProduct),
          queryRunner.manager.getRepository(DiscountCategory),
          id_descuento,
          newScope,
          updateData.target_ids,
        );
      }

      await queryRunner.commitTransaction();
      return await this.getDiscountById(id_descuento);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDiscount(id_descuento: number): Promise<{ message: string }> {
    this.ensureDataSource();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(DiscountProduct, { id_descuento });
      await queryRunner.manager.delete(DiscountCategory, { id_descuento });
      const deleteResult = await queryRunner.manager.delete(Discount, id_descuento);
      if (deleteResult.affected === 0) {
        throw new NotFoundException(`Descuento con ID ${id_descuento} no encontrado para eliminar`);
      }
      await queryRunner.commitTransaction();
      return { message: `Descuento con ID ${id_descuento} eliminado correctamente` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async persistTargets(
    discountProductRepo: Repository<DiscountProduct>,
    discountCategoryRepo: Repository<DiscountCategory>,
    id_descuento: number,
    aplica_a: DiscountScope,
    target_ids?: number[],
  ) {
    if (aplica_a === 'PRODUCT' && target_ids) {
      const unique = Array.from(new Set(target_ids));
      const discountProducts = unique.map((id_producto) =>
        discountProductRepo.create({ id_descuento, id_producto }),
      );
      await discountProductRepo.save(discountProducts);
    }

    if (aplica_a === 'CATEGORY' && target_ids) {
      const unique = Array.from(new Set(target_ids));
      const discountCategories = unique.map((id_categoria) =>
        discountCategoryRepo.create({ id_descuento, id_categoria }),
      );
      await discountCategoryRepo.save(discountCategories);
    }
  }
}