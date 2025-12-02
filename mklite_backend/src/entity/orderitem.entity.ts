import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity'; // Asumo que existe
import { Batch } from './batch.entity';     // Asumo que existe (Lote)

@Entity('pedido_item')
export class OrderItem {
    @PrimaryColumn()
    id_pedido: number;

    @PrimaryColumn()
    id_producto: number;

    @PrimaryColumn()
    id_lote: number;

    @Column()
    cantidad: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_pedido', referencedColumnName: 'id_pedido' })
    order: Order;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'id_lote', referencedColumnName: 'id_lote' })
    batch: Batch;
}
