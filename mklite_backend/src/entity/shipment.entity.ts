import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('envio') // Nombre de la tabla en BD (Español)
@Unique(['id_pedido'])
export class Shipment {
    @PrimaryGeneratedColumn()
    id_envio: number;

    @Column()
    id_pedido: number;

    @Column({ nullable: true })
    id_repartidor: number; // ID del usuario con rol repartidor

    @Column({ length: 100, nullable: true })
    sector: string;

    @Column({ length: 30 })
    estado_envio: string; 

    @Column({ nullable: true })
    fecha_salida: Date;

    @Column({ nullable: true })
    fecha_entrega: Date;

    @Column({ nullable: true })
    minutos_espera: number;

    @Column({ nullable: true })
    calificacion_cliente: number;
}