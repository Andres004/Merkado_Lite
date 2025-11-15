import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
