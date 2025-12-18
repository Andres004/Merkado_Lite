import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DiscountProduct } from './discountproduct.entity';
import { DiscountCategory } from './discountcategory.entity';

export type DiscountScope = 'ALL' | 'CATEGORY' | 'PRODUCT';

@Entity('descuento')
export class Discount {
    @PrimaryGeneratedColumn()
    id_descuento: number;

    @Column({ length: 150 })
    nombre: string;

    @Column({ type: 'datetime' }) // Ajustado a datetime para manejar horas si es necesario
    fecha_inicio: Date;

    @Column({ type: 'datetime' })
    fecha_final: Date;

    @Column({ length: 50, nullable: true })
    codigo_cupon?: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) // Ajustado precision típica para %
    porcentaje_descuento?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_fijo?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_minimo_compra?: number;

    @Column({ default: true }) // Por defecto activo
    estado_de_oferta: boolean;

    @Column({ type: 'enum', enum: ['ALL', 'CATEGORY', 'PRODUCT'], default: 'ALL' })
    aplica_a: DiscountScope;

    // Relación inversa necesaria
    @OneToMany(() => DiscountProduct, (dp) => dp.discount)
    discountProducts: DiscountProduct[];

    @OneToMany(() => DiscountCategory, (dc) => dc.discount)
    discountCategories: DiscountCategory[];
}

