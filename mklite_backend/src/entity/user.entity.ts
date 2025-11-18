import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Cart } from './cart.entity';
import { UserRole } from './userrole.entity';


@Entity()
export class User { //user entity
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido: string;

    @Column({ length: 20 })
    ci: string; // varchar(20)

    @Column({ length: 150, unique: true })
    email: string;
    
    @Column({ length: 255 })
    password: string;

    @Column({ length: 30 })
    telefono: string; // varchar(30)

    @Column({ length: 255 })
    direccion: string; // varchar(255)

    @OneToMany(() => UserRole, (userrole) => userrole.usuario)
    userRoles: UserRole[];

    @OneToMany(() => Cart, (cart) => cart.user)
    carts: Cart[];
}