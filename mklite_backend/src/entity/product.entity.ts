import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { CartItem } from './cartitem.entity';
import { Inventory } from './inventory.entity'; 
import { StockAlert } from './stockalert.entity';
import { Batch } from './batch.entity';
import { ProductCategory } from './productcategory.entity';
import { OrderItem } from './orderitem.entity';
import { RefundItem } from './refunditem.entity';

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

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToOne(() => Inventory, (inventory) => inventory.product)
    inventory: Inventory;

    @OneToMany(() => StockAlert, (stockAlert) => stockAlert.product)
    stockAlerts: StockAlert[];

    @OneToMany(() => Batch, (batch) => batch.product)
    batches: Batch[];

    @OneToMany(() => ProductCategory, (productCategory) => productCategory.producto)
    productCategories: ProductCategory[];

    @OneToMany(() => OrderItem, (item) => item.product)
    orderItems: OrderItem[];

    @OneToMany(() => RefundItem, (refundItem) => refundItem.product)
    refundItems: RefundItem[]; //merge

}
