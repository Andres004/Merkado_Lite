import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from './cartitem.entity';
import { Batch } from './batch.entity';
import { Inventory } from './inventory.entity';
import { StockAlert } from './stockalert.entity';

@Entity('producto')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  id_producto: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_venta: number;

  @Column({ length: 255 })
  imagen_url: string;

  //@OneToMany(() => CartItem, (cartItem) => cartItem.producto)
  //cartItems: CartItem[];

  @OneToMany(() => Batch, (batch) => batch.producto)
  lotes: Batch[];

  @OneToMany(() => Inventory, (inv) => inv.producto)
  inventario: Inventory[];

  @OneToMany(() => StockAlert, (alerta) => alerta.producto)
  alertas: StockAlert[];
}
