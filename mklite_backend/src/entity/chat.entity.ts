import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Mensaje } from './message.entity';

@Entity('chat')
export class Chat {
    @PrimaryGeneratedColumn()
    id_chat: number;

    @Column()
    id_cliente: number;

    @Column({ nullable: true }) // Permite que sea nulo si no hay agente asignado
    id_agente_soporte: number;

    @Column({ nullable: true }) // Permite que sea nulo si no está ligado a un pedido
    id_pedido: number;

    @CreateDateColumn()
    fecha_inicio: Date;

    @Column({ length: 20 })
    estado: string; 

    @OneToMany(() => Mensaje, (mensaje) => mensaje.chat)
    mensajes: Mensaje[];
}