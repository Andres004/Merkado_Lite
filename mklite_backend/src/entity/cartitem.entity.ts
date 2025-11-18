import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Cart } from './cart.entity';

@Entity('carrito_item')
export class CartItem {
  @PrimaryColumn()
  id_carrito: number;

  @PrimaryColumn()
  id_producto: number;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_unitario: number;

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'id_producto' })
  product: Product;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  @JoinColumn({ name: 'id_carrito' })
  cart: Cart;
}
