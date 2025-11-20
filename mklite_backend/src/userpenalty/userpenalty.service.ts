import { Injectable, NotFoundException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { UserPenalty } from "src/entity/userpenalty.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserPenaltyService {
    private userPenaltyRepository: Repository<UserPenalty>;

    private getRepository(): Repository<UserPenalty> {
        if (!AppDataSource.isInitialized) {
            throw new Error('DataSource no está inicializado');
        }
        if (!this.userPenaltyRepository) {
            this.userPenaltyRepository = AppDataSource.getRepository(UserPenalty);
        }
        return this.userPenaltyRepository;
    }

    async createUserPenalty(userPenalty: UserPenalty) {
        return await this.getRepository().save(userPenalty);
    }

    async getAllUserPenalties() {
        return await this.getRepository().find();
    }

    async getUserPenaltyById(id_sancion: number): Promise<UserPenalty> {
        const userPenalty = await this.getRepository().findOneBy({ id_sancion });
        if (!userPenalty) {
            throw new NotFoundException(`UserPenalty con ID ${id_sancion} no encontrado`);
        }
        return userPenalty;
    }

    async deleteUserPenalty(id_sancion: number) {
        const result = await this.getRepository().delete(id_sancion);
        if (result.affected === 0) {
            throw new NotFoundException(`UserPenalty con ID ${id_sancion} no encontrado para eliminar`);
        }
        return { message: `UserPenalty con ID ${id_sancion} eliminado con éxito` };
    }

    async updateUserPenalty(id_sancion: number, userPenaltyUpdate: Partial<UserPenalty>) {
        const result = await this.getRepository().update(id_sancion, userPenaltyUpdate);
        if (result.affected === 0) {
            throw new NotFoundException(`UserPenalty con ID ${id_sancion} no encontrado para actualizar`);
        }
        return this.getUserPenaltyById(id_sancion);
    }
}