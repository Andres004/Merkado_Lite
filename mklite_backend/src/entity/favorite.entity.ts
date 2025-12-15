import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('favorito')
@Unique(['id_usuario', 'id_producto'])
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'id_favorito' })
  id_favorito: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'id_producto' })
  id_producto: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id_usuario' })
  user: User;

  @ManyToOne(() => Product, (product) => product.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
  product: Product;
}