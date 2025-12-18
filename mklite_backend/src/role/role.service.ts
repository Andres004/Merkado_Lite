import { Injectable, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { Role } from "src/entity/role.entity";
import { Repository } from "typeorm";

@Injectable()
export class RoleService {
    private roleRepository: Repository<Role>;

    private getRepository(): Repository<Role> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.roleRepository) {
            this.roleRepository = AppDataSource.getRepository(Role);
        }
        return this.roleRepository;
    }

    async createRole(role: Role) {
        return await this.getRepository().save(role);
    }

    async getAllRoles() {
        return await this.getRepository().find();
    }

    async getRoleById(id_rol: number): Promise<Role> {
        const role = await this.getRepository().findOneBy({ id_rol });
        if (!role) {
            throw new NotFoundException(`Rol con ID ${id_rol} no encontrado`);
        }
        return role;
    }

    async deleteRole(id_rol: number) {
        const result = await this.getRepository().delete(id_rol);
        if (result.affected === 0) {
            throw new NotFoundException(`Rol con ID ${id_rol} no encontrado para eliminar`);
        }
        return { message: `Rol con ID ${id_rol} eliminado con éxito` };
    }

    async updateRole(id_rol: number, roleUpdate: Partial<Role>) {
        const result = await this.getRepository().update(id_rol, roleUpdate);
        if (result.affected === 0) {
            throw new NotFoundException(`Rol con ID ${id_rol} no encontrado para actualizar`);
        }
        return this.getRoleById(id_rol);
    }
}
