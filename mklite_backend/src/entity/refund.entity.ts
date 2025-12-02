import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
<<<<<<< HEAD
import { RefundItem } from './refundItem.entity';
=======
import { RefundItem } from './refunditem.entity';
>>>>>>> Backend-andy
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity('reembolso')
export class Refund {
    @PrimaryGeneratedColumn()
    id_devolucion: number;

<<<<<<< HEAD
    @Column({ name: 'id_usuario_vendedor' }) 
    id_usuario_vendedor: number;
    
   @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
=======
    @Column({ name: 'id_pedido' })
    id_pedido: number;

    @Column({ name: 'id_usuario_vendedor' }) 
    id_usuario_vendedor: number;
    
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
>>>>>>> Backend-andy
    fecha: Date;

    @Column({ name: 'motivo' })
    motivo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto_total' }) 
    monto_total: number;

<<<<<<< HEAD
    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario_vendedor', referencedColumnName: 'id_usuario' })
    vendedor: User;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'id_pedido', referencedColumnName: 'id_pedido' })
    pedido: Order;
=======

    @ManyToOne(() => User, (user) => user.processedRefunds)
    @JoinColumn({ name: 'id_usuario_vendedor', referencedColumnName: 'id_usuario' })
    seller: User;

    @ManyToOne(() => Order, (order) => order.refunds)
    @JoinColumn({ name: 'id_pedido', referencedColumnName: 'id_pedido' })
    order: Order;
>>>>>>> Backend-andy

    @OneToMany(() => RefundItem, (refundItem) => refundItem.refund)
    refundItems: RefundItem[];
}