import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
<<<<<<< HEAD
import { AppDataSource } from "src/data-source"; // Ajuste la ruta según su proyecto
import { UserRole } from "src/entity/userrole.entity"; // Ajuste la ruta
=======
import { AppDataSource } from "src/data-source"; 
import { UserRole } from "src/entity/userrole.entity"; 
>>>>>>> Backend-andy
import { Repository } from "typeorm";

@Injectable()
export class UserRoleService {
    private userroleRepository: Repository<UserRole>;

<<<<<<< HEAD
    // Método para obtener el repositorio
=======
>>>>>>> Backend-andy
    private getRepository(): Repository<UserRole> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.userroleRepository) {
            this.userroleRepository = AppDataSource.getRepository(UserRole);
        }
        return this.userroleRepository;
    }

<<<<<<< HEAD
    //Asignar Rol a usuario
=======
    // Asignar Rol a usuario
>>>>>>> Backend-andy
    async assignRoleToUser(dto: { id_usuario: number, id_rol: number }) {
        const { id_usuario, id_rol } = dto;

        const existingAssignment = await this.getRepository().findOneBy({ id_usuario, id_rol });
        if (existingAssignment) {
            throw new ConflictException(`El usuario ${id_usuario} ya tiene el rol ${id_rol}`);
        }

        const assignment = this.getRepository().create({ id_usuario, id_rol });
        return await this.getRepository().save(assignment);
    }

<<<<<<< HEAD
    //Obtener todas las asignaciones
    async getAllAssignments() {
        return await this.getRepository().find({ relations: ['usuario', 'rol'] });
    }

    //Obtener asignaciones a un user en especifico
    async getRolesForUser(id_usuario: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_usuario },
            relations: ['rol'], // Carga la información del rol
=======
    // Obtener todas las asignaciones (relations corregidos)
    async getAllAssignments() {
        return await this.getRepository().find({ relations: ['user', 'role'] });
    }

    // Obtener asignaciones a un user en especifico
    async getRolesForUser(id_usuario: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_usuario },
            relations: ['role'], // Carga la información del role
>>>>>>> Backend-andy
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron roles para el usuario con ID ${id_usuario}`);
        }
        return assignments;
    }

<<<<<<< HEAD
    //Obtener asignaciones a un rol en especifico
    async getUsersByRole(id_rol: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_rol },
            relations: ['usuario'], // Carga la información del usuario
=======
    // Obtener asignaciones a un rol en especifico
    async getUsersByRole(id_rol: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_rol },
            relations: ['user'], // Carga la información del user
>>>>>>> Backend-andy
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron usuarios para el rol con ID ${id_rol}`);
        }
        return assignments;
    }

<<<<<<< HEAD
    //Elimina role de un user
=======
    // Elimina role de un user
>>>>>>> Backend-andy
    async removeRoleFromUser(id_usuario: number, id_rol: number) {
        const result = await this.getRepository().delete({ id_usuario, id_rol });

        if (result.affected === 0) {
            throw new NotFoundException(`Asignación no encontrada para usuario ${id_usuario} y rol ${id_rol}`);
        }
        return { message: `Rol ${id_rol} eliminado del usuario ${id_usuario} con éxito` };
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> Backend-andy
