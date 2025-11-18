import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity'; 
import { Category } from './category.entity'; 

@Entity('producto_categoria')
export class ProductCategory {
    @PrimaryColumn({ name: 'id_producto' })
    id_producto: number;

    @PrimaryColumn({ name: 'id_categoria' })
    id_categoria: number;

    @ManyToOne(() => Product, (product) => product.productCategories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    producto: Product;

    @ManyToOne(() => Category, (category) => category.productCategories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id_categoria' })
    categoria: Category;
}
