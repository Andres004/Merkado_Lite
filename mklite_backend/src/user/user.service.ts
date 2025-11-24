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
        return await this.getRepository().find({
            relations: [
                'userRoles',      
                'userRoles.rol' 
            ],
        });
    }
    
    async getUserById(id_usuario: number): Promise<User> {
        const user = await this.getRepository().findOne({
            where: { id_usuario },
            relations: [
                'userRoles',      
                'userRoles.rol'   
            ],
        });

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

    // Bloquear usuario (HU-F10, HU-F14)
    async blockUser(id_usuario: number): Promise<User> {
        const user = await this.getUserById(id_usuario);
        user.activo = false;
        return await this.getRepository().save(user);
    }

    // Desbloquear usuario
    async unblockUser(id_usuario: number): Promise<User> {
        const user = await this.getUserById(id_usuario);
        user.activo = true;
        return await this.getRepository().save(user);
    }

    // Verificar si usuario puede realizar compras (no bloqueado y sin penalizaciones activas)
    async canUserMakePurchase(id_usuario: number, userPenaltyService: any): Promise<boolean> {
        const user = await this.getUserById(id_usuario);
        const hasActivePenalty = await userPenaltyService.userHasActivePenalty(id_usuario);
        
        return user.activo && !hasActivePenalty;
    }

    // Cambiar contraseña
    async changePassword(id_usuario: number, newPassword: string): Promise<User> {
        const user = await this.getUserById(id_usuario);
        user.password = newPassword; // En producción, asegúrate de hashear la contraseña
        return await this.getRepository().save(user);
    }

    // Obtener usuarios bloqueados
    async getBlockedUsers(): Promise<User[]> {
        return await this.getRepository().find({
            where: { activo: false },
            relations: ['sanciones']
        });
    }

    // Obtener usuarios con penalizaciones activas
    async getUsersWithActivePenalties(userPenaltyService: any): Promise<User[]> {
        const allUsers = await this.getAllUsers();
        const usersWithPenalties: User[] = [];

        for (const user of allUsers) {
            const hasActivePenalty = await userPenaltyService.userHasActivePenalty(user.id_usuario);
            if (hasActivePenalty) {
                usersWithPenalties.push(user);
            }
        }

        return usersWithPenalties;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.getRepository().findOne({
            where: { email },
            relations: ['userRoles', 'userRoles.rol']
        });
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        
        try {
            const user = await this.getUserByEmail(email);
            // En producción, comparar con contraseña hasheada
            if (user && user.password === password && user.activo) {
                return user;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}
