import { Injectable, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    private userRepository: Repository<User>;

    private getRepository(): Repository<User> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.userRepository) {
            this.userRepository = AppDataSource.getRepository(User);
        }
        return this.userRepository;
    }

    async createUser(user: User) {
        return await this.getRepository().save(user);
    }

    async getAllUsers() {
        return await this.getRepository().find();
    }
    
    async getUserById(id_usuario: number): Promise<User> {
        const user = await this.getRepository().findOneBy({ id_usuario });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);
        }
        return user;
    }

    async deleteUser(id_usuario: number) {
        const result = await this.getRepository().delete(id_usuario);
        if (result.affected === 0) {
            throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado para eliminar`);
        }
        return { message: `Usuario con ID ${id_usuario} eliminado con éxito` };
    }

    async updateUser(id_usuario: number, userUpdate: Partial<User>) {
        const result = await this.getRepository().update(id_usuario, userUpdate);
        if (result.affected === 0) {
            throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado para actualizar`);
        }
        return this.getUserById(id_usuario);
    }
}
