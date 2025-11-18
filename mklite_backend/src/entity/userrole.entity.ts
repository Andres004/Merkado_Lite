import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity'; 
import { Role } from './role.entity'; 

@Entity('usuario_rol')
export class UserRole {
    @PrimaryColumn()
    id_usuario: number;

    @PrimaryColumn()
    id_rol: number;

    @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id_usuario' })
    usuario: User;

    @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_rol', referencedColumnName: 'id_rol' })
    rol: Role;
}