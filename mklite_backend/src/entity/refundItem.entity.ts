import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Refund } from './refund.entity';
import { Product } from './product.entity';

@Entity('reembolso_item')
export class RefundItem {
  @PrimaryColumn()
  id_devolucion: number;

  @PrimaryColumn()
  id_producto: number;

  @Column()
  cantidad: number;
  
  @Column('decimal', { precision: 10, scale: 2 })
  precio_unitario: number;
  
  @ManyToOne(() => Refund, (refund) => refund.refundItems)
  @JoinColumn({ name: 'id_devolucion' })
  refund: Refund;
    
  @ManyToOne(() => Product, (product) => product.refundItems)
  @JoinColumn({ name: 'id_producto' })
  product: Product;

}