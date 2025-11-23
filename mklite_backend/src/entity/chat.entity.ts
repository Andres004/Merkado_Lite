import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity('chat')
export class Chat {
    @PrimaryGeneratedColumn()
    id_chat: number;

    @Column()
    id_cliente: number;

    @Column({ nullable: true }) 
    id_agente_soporte: number;

    @Column({ nullable: true }) 
    id_pedido: number;

    @CreateDateColumn()
    fecha_inicio: Date;

    @Column({ length: 20 })
    estado: string; 



    @ManyToOne(() => User, (user) => user.chatsAsClient)
    @JoinColumn({ name: 'id_cliente' }) 
    client: User;

  
    @ManyToOne(() => User, (user) => user.chatsAsSupport)
    @JoinColumn({ name: 'id_agente_soporte' }) 
    supportAgent: User;

   
    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}