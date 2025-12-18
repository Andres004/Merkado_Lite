import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Shipment } from './shipment.entity';

@Entity('sancion_usuario')
export class UserPenalty {
    @PrimaryGeneratedColumn()
    id_sancion: number;

    @Column()
    id_usuario: number;

    @Column()
    id_envio: number;

    @Column({ type: 'text' })
    motivo: string;

    @Column({ type: 'datetime' })
    fecha_inicio: Date;

    @Column({ type: 'datetime' })
    fecha_fin: Date;

    @Column({ length: 20 })
    estado: string; 

    @ManyToOne(() => User, (user) => user.penalties)
    @JoinColumn({ name: 'id_usuario' })
    user: User;

    @ManyToOne(() => Shipment, (shipment) => shipment.penalties)
    @JoinColumn({ name: 'id_envio' })
    shipment: Shipment;
}