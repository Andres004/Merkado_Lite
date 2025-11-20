import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './userrole.entity';

@Entity('rol')
export class Role {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column({ length: 50 })
    nombre: string;

    @OneToMany(() => UserRole, (userrole) => userrole.rol)
    userRoles: UserRole[];
}