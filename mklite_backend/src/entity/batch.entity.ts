import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity'; // Ajusta la ruta
<<<<<<< HEAD
import { Supplier } from './supplier.entity';
=======
import { Supplier } from './supplier.entity'; // Ajusta la ruta
>>>>>>> Backend-andy

@Entity('lote')
export class Batch {
    @PrimaryGeneratedColumn({ name: 'id_lote' })
    id_lote: number;

    @Column({ name: 'id_producto' })
    id_producto: number;

    @Column({ name: 'id_proveedor' })
    id_proveedor: number;

    @Column({ type: 'date' })
    fecha_recepcion: Date;

    @Column({ type: 'date' })
    fecha_vencimiento: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    costo_unitario: number;

    @Column()
    cantidad_inicial: number;

    @Column()
    cantidad_disponible: number;

    @Column({ length: 20 })
    estado_lote: string; // 'activo', 'vencido', 'defectuoso'

    // Relaciones
    @ManyToOne(() => Product, (product) => product.batches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto', referencedColumnName: 'id_producto' })
    product: Product;

    @ManyToOne(() => Supplier, (supplier) => supplier.batches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_proveedor', referencedColumnName: 'id_proveedor' })
    supplier: Supplier;
}