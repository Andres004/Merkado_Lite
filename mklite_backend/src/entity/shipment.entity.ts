<<<<<<< HEAD
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';
=======
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
>>>>>>> Backend-andy
import { UserPenalty } from './userpenalty.entity';

@Entity('envio')
@Unique(['id_pedido'])
export class Shipment {
    @PrimaryGeneratedColumn()
    id_envio: number;

    @Column()
    id_pedido: number;

    @Column({ nullable: true })
<<<<<<< HEAD
    id_repartidor: number; // ID del usuario con rol repartidor
=======
    id_repartidor: number;
>>>>>>> Backend-andy

    @Column({ length: 100, nullable: true })
    sector: string;

<<<<<<< HEAD
    @Column({ 
        type: 'enum', 
        enum: ['PROCESANDO', 'EN_CAMINO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO'],
        default: 'PROCESANDO'
    })
    estado_envio: string;
=======
    @Column({ length: 30 })
    estado_envio: string; 
>>>>>>> Backend-andy

    @Column({ nullable: true })
    fecha_salida: Date;

    @Column({ nullable: true })
    fecha_entrega: Date;

    @Column({ nullable: true })
    minutos_espera: number;

    @Column({ nullable: true })
    calificacion_cliente: number;

<<<<<<< HEAD
    @OneToMany(() => UserPenalty, (userPenalty) => userPenalty.envio)
    sanciones: UserPenalty[];

=======
    @OneToOne(() => Order, (order) => order.shipment)
    @JoinColumn({ name: 'id_pedido' }) 
    order: Order; 

    @OneToMany(() => UserPenalty, (penalty) => penalty.shipment)
    penalties: UserPenalty[];
>>>>>>> Backend-andy
}