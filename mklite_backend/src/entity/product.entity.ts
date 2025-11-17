import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from './cartitem.entity';
import { RefundItem } from './refundItem.entity';

@Entity('producto') 
export class Product {
    @PrimaryGeneratedColumn({ name: 'id_producto' }) 
    id_producto: number;

    @Column({ length: 150 })
    nombre: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_venta: number;

    @Column({ length: 255 })
    imagen_url: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => RefundItem, (refundItem) => refundItem.product)
    refundItems: RefundItem[];
}
