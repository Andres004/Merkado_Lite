import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';

@Entity('mensaje')
export class Message {
    @PrimaryGeneratedColumn()
    id_mensaje: number;

    @Column()
    id_chat: number;

    @Column()
    id_remitente: number;

    @CreateDateColumn()
    fecha_hora: Date;

    @Column({ type: 'text' })
    contenido: string;

    @Column({ default: false })
    leido: boolean;


    @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_chat' })
    chat: Chat;

    @ManyToOne(() => User, (user) => user.sentMessages)
    @JoinColumn({ name: 'id_remitente' }) 
    sender: User;
}