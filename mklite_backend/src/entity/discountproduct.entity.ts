import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Discount } from './discount.entity';
import { Product } from './product.entity';

@Entity('descuento_producto')
export class DiscountProduct {
    @PrimaryColumn({ name: 'id_descuento' })
    id_descuento: number;

    @PrimaryColumn({ name: 'id_producto' })
    id_producto: number;

    @ManyToOne(() => Discount, (discount) => discount.discountProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_descuento', referencedColumnName: 'id_descuento' })
    discount: Discount;

    @ManyToOne(() => Product, (product) => product.discountProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;
}