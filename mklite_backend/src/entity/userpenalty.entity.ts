import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Shipment } from './shipment.entity';

@Entity('user_penalty')
export class UserPenalty {
    @PrimaryGeneratedColumn()
    id_sancion: number;

    @Column()
    id_usuario: number;

    @Column()
    id_envio: number;

    @Column({ type: 'text' })
    motivo: string;

    @Column({ type: 'timestamp' })
    fecha_inicio: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_fin: Date;

    @Column()
    estado: boolean;

    @ManyToOne(() => User, (user) => user.id_usuario)
    @JoinTable({ name: 'id_usuario' })
    usuario: User;

    @ManyToOne(() => Shipment, (shipment) => shipment.id_envio)
    @JoinTable({ name: 'id_envio' })
    envio: Shipment;
}