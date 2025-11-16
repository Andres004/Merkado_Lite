import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';

@Entity('lote')
export class Batch {
  @PrimaryGeneratedColumn({ name: 'id_lote' })
  id_lote: number;

  @Column()
  id_producto: number;

  @ManyToOne(() => Product, (product) => product.lotes)
  @JoinColumn({ name: 'id_producto' })
  producto: Product;

  @Column()
  id_proveedor: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.lotes)
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Supplier;

  @Column({ type: 'date' })
  fecha_recepcion: Date;

  @Column({ type: 'date' })
  fecha_vencimiento: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_unitario: number;

  @Column()
  cantidad_inicial: number;

  @Column()
  cantidad_disponible: number;

  @Column({ length: 20 })
  estado_lote: string; // activo, vencido, defectuoso
}
