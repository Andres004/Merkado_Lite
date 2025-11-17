import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Decimal128} from 'typeorm';

@Entity('descuento')
export class  Discount{
    @PrimaryGeneratedColumn()
    id_descuento: number;

    @Column()
    fecha_inicio: Date

    @Column()
    fecha_final: Date

    @Column()
    codigo_cupon: string

    @Column({type: 'decimal', precision: 10, scale: 2 })
    porcentaje_descuento: number

    @Column({type: 'decimal', precision: 10, scale: 2 })
    monto_fijo: number

    @Column()
    estado_de_oferta: boolean
}