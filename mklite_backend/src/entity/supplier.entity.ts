import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Batch } from './batch.entity';

@Entity('proveedor')
export class Supplier {
    @PrimaryGeneratedColumn({ name: 'id_proveedor' })
    id_proveedor: number;

    @Column({ length: 150 })
    nombre: string;

    @Column({ length: 50 })
    telefono: string;

    @Column({ length: 150 })
    email: string;

    @Column({ length: 255 })
    direccion: string;

    @OneToMany(() => Batch, (batch) => batch.supplier)
    batches: Batch[];
<<<<<<< HEAD
}
=======
}
>>>>>>> Backend-andy
