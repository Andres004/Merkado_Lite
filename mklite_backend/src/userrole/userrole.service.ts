import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { AppDataSource } from "src/data-source"; 
import { UserRole } from "src/entity/userrole.entity"; 
import { Repository } from "typeorm";

@Injectable()
export class UserRoleService {
    private userroleRepository: Repository<UserRole>;

    private getRepository(): Repository<UserRole> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.userroleRepository) {
            this.userroleRepository = AppDataSource.getRepository(UserRole);
        }
        return this.userroleRepository;
    }

    // Asignar Rol a usuario
    async assignRoleToUser(dto: { id_usuario: number, id_rol: number }) {
        const { id_usuario, id_rol } = dto;

        const existingAssignment = await this.getRepository().findOneBy({ id_usuario, id_rol });
        if (existingAssignment) {
            throw new ConflictException(`El usuario ${id_usuario} ya tiene el rol ${id_rol}`);
        }

        const assignment = this.getRepository().create({ id_usuario, id_rol });
        return await this.getRepository().save(assignment);
    }

    // Obtener todas las asignaciones (relations corregidos)
    async getAllAssignments() {
        return await this.getRepository().find({ relations: ['user', 'role'] });
    }

    // Obtener asignaciones a un user en especifico
    async getRolesForUser(id_usuario: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_usuario },
            relations: ['role'], // Carga la información del role
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron roles para el usuario con ID ${id_usuario}`);
        }
        return assignments;
    }

    // Obtener asignaciones a un rol en especifico
    async getUsersByRole(id_rol: number): Promise<UserRole[]> {
        const assignments = await this.getRepository().find({
            where: { id_rol },
            relations: ['user'], // Carga la información del user
        });
        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`No se encontraron usuarios para el rol con ID ${id_rol}`);
        }
        return assignments;
    }

    // Elimina role de un user
    async removeRoleFromUser(id_usuario: number, id_rol: number) {
        const result = await this.getRepository().delete({ id_usuario, id_rol });

        if (result.affected === 0) {
            throw new NotFoundException(`Asignación no encontrada para usuario ${id_usuario} y rol ${id_rol}`);
        }
        return { message: `Rol ${id_rol} eliminado del usuario ${id_usuario} con éxito` };
    }
}
