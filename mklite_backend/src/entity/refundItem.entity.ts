import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Refund } from './refund.entity';
import { Product } from './product.entity';

@Entity('devolucion_item') 
export class RefundItem {

    @PrimaryColumn()
    id_devolucion: number;

    @PrimaryColumn()
    id_producto: number;

    @Column()
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Refund, (refund) => refund.refundItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_devolucion', referencedColumnName: 'id_devolucion' })
    refund: Refund;

    @ManyToOne(() => Product, (product) => product.refundItems)
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;
}