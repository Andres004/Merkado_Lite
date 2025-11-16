import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('inventario')
export class Inventory {
  @PrimaryColumn({ name: 'id_producto' })
  id_producto: number;

  @ManyToOne(() => Product, (product) => product.inventario)
  @JoinColumn({ name: 'id_producto' })
  producto: Product;

  @Column()
  stock_disponible: number;

  @Column()
  stock_reservado: number;

  @Column()
  stock_minimo: number;

  @Column({ type: 'datetime' })
  ultima_actualizacion: Date;
}
