import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RefundItem } from './refundItem.entity';

@Entity('reembolso')
export class Refund {
    @PrimaryGeneratedColumn()
    id_devolucion: number;

    // TODO: Agregar cuando la entidad Pedido esté disponible
    // @Column({ name: 'id_pedido' })
    // id_pedido: number;

    @Column({ name: 'id_vendedor' })
    id_vendedor: number; // Este es el id_usuario que debe tener rol de vendedor

    @Column({ name: 'fecha_devolucion' })
    fecha_devolucion: Date;

    @Column({ name: 'motivo' })
    motivo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto' })
    monto: number;

    // TODO: Agregar cuando la entidad UsuarioRol
    /*
    // Relación con UsuarioRol para validar que el id_vendedor tiene rol de vendedor
    @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.reembolsos)
    @JoinColumn({ name: 'id_vendedor', referencedColumnName: 'id_usuario' })
    usuarioRol: UsuarioRol;

    @ManyToOne(() => Pedido, (pedido) => pedido.reembolsos)
    @JoinColumn({ name: 'id_pedido', referencedColumnName: 'id_pedido' })
    pedido: Pedido;
    */

    @OneToMany(() => RefundItem, (refundItem) => refundItem.refund)
    refundItems: RefundItem[];
}