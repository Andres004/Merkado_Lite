import { Injectable, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { UserPenalty } from "src/entity/userpenalty.entity";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserPenaltyService {
    private userPenaltyRepository: Repository<UserPenalty>;
    private userRepository: Repository<User>;

    constructor() {
        if (AppDataSource.isInitialized) {
            this.userPenaltyRepository = AppDataSource.getRepository(UserPenalty);
            this.userRepository = AppDataSource.getRepository(User);
        }
    }

    private getPenaltyRepo(): Repository<UserPenalty> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.userPenaltyRepository) this.userPenaltyRepository = AppDataSource.getRepository(UserPenalty);
        return this.userPenaltyRepository;
    }

    private getUserRepo(): Repository<User> {
        if (!AppDataSource.isInitialized) throw new Error('DataSource no está inicializado');
        if (!this.userRepository) this.userRepository = AppDataSource.getRepository(User);
        return this.userRepository;
    }

    async createUserPenalty(penaltyData: Partial<UserPenalty>) {
        const user = await this.getUserRepo().findOneBy({ id_usuario: penaltyData.id_usuario });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const penalty = this.getPenaltyRepo().create(penaltyData);
        const savedPenalty = await this.getPenaltyRepo().save(penalty);

        user.accountStatus = 'bloqueado'; 
        await this.getUserRepo().save(user);

        return savedPenalty;
    }

    async getAllUserPenalties() {
        return await this.getPenaltyRepo().find({ relations: ['user', 'shipment'] });
    }

    async getUserPenaltyById(id: number): Promise<UserPenalty> {
        const penalty = await this.getPenaltyRepo().findOne({ 
            where: { id_sancion: id },
            relations: ['user', 'shipment']
        });
        if (!penalty) {
            throw new NotFoundException(`Sanción con ID ${id} no encontrada`);
        }
        return penalty;
    }

    async deleteUserPenalty(id: number) {
        const result = await this.getPenaltyRepo().delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Sanción con ID ${id} no encontrada para eliminar`);
        }
        return { message: `Sanción ${id} eliminada con éxito` };
    }

    async updateUserPenalty(id: number, updateData: Partial<UserPenalty>) {
        const result = await this.getPenaltyRepo().update(id, updateData);
        if (result.affected === 0) {
            throw new NotFoundException(`Sanción con ID ${id} no encontrada para actualizar`);
        }
        return this.getUserPenaltyById(id);
    }
}