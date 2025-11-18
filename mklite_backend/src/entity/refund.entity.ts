import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { RefundItem } from './refundItem.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity('reembolso')
export class Refund {
    @PrimaryGeneratedColumn()
    id_devolucion: number;

    @Column({ name: 'id_usuario_vendedor' }) 
    id_usuario_vendedor: number;
    
   @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @Column({ name: 'motivo' })
    motivo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto_total' }) 
    monto_total: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario_vendedor', referencedColumnName: 'id_usuario' })
    vendedor: User;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'id_pedido', referencedColumnName: 'id_pedido' })
    pedido: Order;

    @OneToMany(() => RefundItem, (refundItem) => refundItem.refund)
    refundItems: RefundItem[];
}