import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';
import { UserPenalty } from './userpenalty.entity';

@Entity('envio')
@Unique(['id_pedido'])
export class Shipment {
    @PrimaryGeneratedColumn()
    id_envio: number;

    @Column()
    id_pedido: number;

    @Column({ nullable: true })
    id_repartidor: number; // ID del usuario con rol repartidor

    @Column({ length: 100, nullable: true })
    sector: string;

    @Column({ 
        type: 'enum', 
        enum: ['PROCESANDO', 'EN_CAMINO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO'],
        default: 'PROCESANDO'
    })
    estado_envio: string;

    @Column({ nullable: true })
    fecha_salida: Date;

    @Column({ nullable: true })
    fecha_entrega: Date;

    @Column({ nullable: true })
    minutos_espera: number;

    @Column({ nullable: true })
    calificacion_cliente: number;

    @OneToMany(() => UserPenalty, (userPenalty) => userPenalty.envio)
    sanciones: UserPenalty[];

}