import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from 'typeorm';
import { ProductCategory } from './productcategory.entity';

@Entity('categoria')
export class Category {
    @PrimaryGeneratedColumn({ name: 'id_categoria' })
    id_categoria: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'text' })
    descripcion: string;

    @OneToMany(() => ProductCategory, (pc) => pc.categoria)
    productCategories: ProductCategory[];
}
