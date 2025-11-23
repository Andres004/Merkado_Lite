import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { UserPenalty } from './userpenalty.entity';

@Entity('envio')
@Unique(['id_pedido'])
export class Shipment {
    @PrimaryGeneratedColumn()
    id_envio: number;

    @Column()
    id_pedido: number;

    @Column({ nullable: true })
    id_repartidor: number;

    @Column({ length: 100, nullable: true })
    sector: string;

    @Column({ length: 30 })
    estado_envio: string; 

    @Column({ nullable: true })
    fecha_salida: Date;

    @Column({ nullable: true })
    fecha_entrega: Date;

    @Column({ nullable: true })
    minutos_espera: number;

    @Column({ nullable: true })
    calificacion_cliente: number;

    @OneToOne(() => Order, (order) => order.shipment)
    @JoinColumn({ name: 'id_pedido' }) 
    order: Order; 

    @OneToMany(() => UserPenalty, (penalty) => penalty.shipment)
    penalties: UserPenalty[];
}