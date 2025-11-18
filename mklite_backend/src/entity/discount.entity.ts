import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DiscountProduct } from './discountProduct.entity';

@Entity('descuento')
export class Discount {
    @PrimaryGeneratedColumn()
    id_descuento: number;

    @Column({ type: 'datetime' }) // Ajustado a datetime para manejar horas si es necesario
    fecha_inicio: Date;

    @Column({ type: 'datetime' })
    fecha_final: Date;

    @Column({ length: 50 })
    codigo_cupon: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 }) // Ajustado precision típica para %
    porcentaje_descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_fijo: number;

    @Column({ default: true }) // Por defecto activo
    estado_de_oferta: boolean;

    // Relación inversa necesaria
    @OneToMany(() => DiscountProduct, (dp) => dp.discount)
    discountProducts: DiscountProduct[];
}
