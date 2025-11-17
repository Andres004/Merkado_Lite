import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PedidoItem } from './pedido_item.entity';

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id_pedido: number;

  @Column()
  id_usuario_cliente: number;

  @Column({ length: 20 })
  tipo_pedido: string; 

  @Column({ length: 20 })
  metodo_pago: string; 

  @Column({ length: 30 })
  estado: string; 

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo_envio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 255 })
  direccion_entrega: string;

  @Column({ length: 20 })
  tipo_entrega: string; 

  @Column({ default: false })
  es_reserva: boolean;

  @Column({ nullable: true })
  fecha_hora_programada: Date;

  @Column({ nullable: true })
  id_descuento_aplicado: number;

  @OneToMany(() => PedidoItem, (item) => item.pedido)
  items: PedidoItem[];
} 