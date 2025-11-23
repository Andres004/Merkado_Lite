import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('inventario')
export class Inventory {
    @PrimaryColumn({ name: 'id_producto' })
    id_producto: number;

    @Column({ default: 0 })
    stock_disponible: number;

    @Column({ default: 0 })
    stock_reservado: number;

    @Column({ default: 0 })
    stock_minimo: number;

    @Column({ default: 0 })
    stock_vencido: number;

    @Column({ default: 0 })
    stock_danado: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ultima_actualizacion: Date;

    @OneToOne(() => Product, (product) => product.inventory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;
}