import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_inicio: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_fin: Date;

    @Column({ type: 'varchar', length: 20, default: 'ACTIVA' })
    estado: string;

    // Relaciones corregidas
    @ManyToOne(() => User, (user) => user.sanciones)
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;

    @ManyToOne(() => Shipment, (shipment) => shipment.sanciones)
    @JoinColumn({ name: 'id_envio' })
    envio: Shipment;
}