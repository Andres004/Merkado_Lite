import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Discount } from './discount.entity';
import { Category } from './category.entity';

@Entity('descuento_categoria')
export class DiscountCategory {
    @PrimaryColumn({ name: 'id_descuento' })
    id_descuento: number;

    @PrimaryColumn({ name: 'id_categoria' })
    id_categoria: number;

    @ManyToOne(() => Discount, (discount) => discount.discountCategories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_descuento', referencedColumnName: 'id_descuento' })
    discount: Discount;

    @ManyToOne(() => Category, (category) => category.discountCategories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id_categoria' })
    category: Category;
}