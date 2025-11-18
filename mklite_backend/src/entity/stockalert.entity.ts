import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity'; // Ajusta la ruta

@Entity('alerta_stock')
export class StockAlert {
    @PrimaryGeneratedColumn({ name: 'id_alerta' })
    id_alerta: number;

    @Column({ name: 'id_producto' })
    id_producto: number;

    @Column({ length: 50 })
    tipo_alerta: string;

    @Column({ type: 'datetime' })
    fecha_alerta: Date;

    @Column({ type: 'text' })
    mensaje: string;

    @ManyToOne(() => Product, (product) => product.stockAlerts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;
}
