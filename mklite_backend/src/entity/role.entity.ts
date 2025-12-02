import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './userrole.entity';

@Entity('rol')
export class Role {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column({ length: 50 })
    nombre: string;

<<<<<<< HEAD
    @OneToMany(() => UserRole, (userrole) => userrole.rol)
    userRoles: UserRole[];
}
=======
    @OneToMany(() => UserRole, (userrole) => userrole.role)
    userRoles: UserRole[];
}
>>>>>>> Backend-andy
