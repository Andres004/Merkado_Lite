<<<<<<< HEAD
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './orderitem.entity';
=======
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './orderitem.entity';
import { Refund } from './refund.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';
>>>>>>> Backend-andy

@Entity('pedido')
export class Order {
    @PrimaryGeneratedColumn()
    id_pedido: number;

<<<<<<< HEAD
    @Column()
=======
    @Column({ name: 'id_usuario_cliente' }) // Mapeo explícito a columna
>>>>>>> Backend-andy
    id_usuario_cliente: number;

    @Column({ length: 20 })
    tipo_pedido: string; 

    @Column({ length: 20 })
    metodo_pago: string; 

    @Column({ length: 30 })
    estado: string; 

    @CreateDateColumn()
    fecha_creacion: Date;

    @UpdateDateColumn()
    fecha_actualizacion: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    costo_envio: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ length: 255 })
    direccion_entrega: string;

    @Column({ length: 20 })
    tipo_entrega: string; 

    @Column({ default: false })
    es_reserva: boolean;

    @Column({ nullable: true })
    fecha_hora_programada: Date;

    @Column({ nullable: true })
    id_descuento_aplicado: number;

<<<<<<< HEAD
    // Relación actualizada a OrderItem
    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[];
=======

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'id_usuario_cliente', referencedColumnName: 'id_usuario' })
    client: User;

    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[];

    @OneToMany(() => Refund, (refund) => refund.order)
    refunds: Refund[];

    @OneToOne(() => Shipment, (shipment) => shipment.order)
    shipment: Shipment;
>>>>>>> Backend-andy
}