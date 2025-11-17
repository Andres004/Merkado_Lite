import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity('pedido_item')
export class PedidoItem {
  // Claves primarias compuestas
  @PrimaryColumn()
  id_pedido: number;

  @PrimaryColumn()
  id_producto: number;
  
  @PrimaryColumn()
  id_lote: number; 

  // Relación con Pedido
  @ManyToOne(() => Pedido, (pedido) => pedido.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;
}