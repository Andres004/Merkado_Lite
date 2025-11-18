import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity'; // ajusta la ruta
import { CartItem } from './cartitem.entity';

@Entity('carrito')
export class Cart {
  @PrimaryGeneratedColumn({ name: 'id_carrito' })
  id_carrito: number;

  @Column()
  id_usuario: number;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'id_usuario' })
  user: User;

  @Column({ type: 'datetime' })
  fecha_creacion: Date;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'boolean', default: false })
  descuento_aplicado: boolean;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  cartItems: CartItem[];
}