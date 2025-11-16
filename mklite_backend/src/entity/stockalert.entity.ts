import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('alerta_stock')
export class StockAlert {
  @PrimaryGeneratedColumn({ name: 'id_alerta' })
  id_alerta: number;

  @Column()
  id_producto: number;

  @ManyToOne(() => Product, (product) => product.alertas)
  @JoinColumn({ name: 'id_producto' })
  producto: Product;

  @Column({ length: 50 })
  tipo_alerta: string; // Umbral mínimo / Vencimiento

  @Column({ type: 'datetime' })
  fecha_alerta: Date;

  @Column({ type: 'text' })
  mensaje: string;
}
