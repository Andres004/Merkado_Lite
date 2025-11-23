import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cart } from './cart.entity';
import { UserRole } from './userrole.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Order } from './order.entity';
import { Refund } from './refund.entity';

@Entity('usuario')
export class User {
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido: string;

    @Column({ length: 20 })
    ci: string; 

    @Column({ length: 150, unique: true })
    email: string;
    
    @Column({ length: 255, select: false }) 
    password: string;

    @Column({ length: 30, nullable: true }) 
    telefono: string;

    @Column({ length: 255, nullable: true })
    direccion: string;

    // --- RELACIONES ---

    @OneToMany(() => UserRole, (userrole) => userrole.usuario)
    userRoles: UserRole[];

    @OneToMany(() => Cart, (cart) => cart.user)
    carts: Cart[];

    @OneToMany(() => Chat, (chat) => chat.client)
    chatsAsClient: Chat[];

    @OneToMany(() => Chat, (chat) => chat.supportAgent)
    chatsAsSupport: Chat[];

    @OneToMany(() => Message, (message) => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Order, (order) => order.client)
    orders: Order[];

    @OneToMany(() => Refund, (refund) => refund.seller)
    processedRefunds: Refund[];
}