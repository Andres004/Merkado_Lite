import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { UserPenalty } from "src/entity/userpenalty.entity";
import { IsNull, Repository, MoreThan } from "typeorm";

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

    async createUserPenalty(userPenalty: Partial<UserPenalty>): Promise<UserPenalty> {
        if (!userPenalty.id_usuario) {
            throw new BadRequestException('El id_usuario es requerido');
        }

        const hasActivePenalty = await this.userHasActivePenalty(userPenalty.id_usuario);
        if (hasActivePenalty) {
            throw new BadRequestException('El usuario ya tiene una penalización activa');
        }

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

    // Crear sanción por no aparición (HU-F14)
    async createPenaltyForNoShow(id_usuario: number, id_envio: number): Promise<UserPenalty> {
        const penaltyData = {
            id_usuario,
            id_envio,
            motivo: 'Cliente no apareció en el lugar de entrega después de 15 minutos de espera',
            fecha_inicio: new Date(),
            fecha_fin: this.calculatePenaltyEndDate(),
            estado: 'ACTIVA'
        };

        return await this.getRepository().save(penaltyData);
    }

    // Calcular fecha de fin de penalización (7 días)
    private calculatePenaltyEndDate(): Date {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        return endDate;
    }


    // Verificar si usuario tiene penalización activa (CORREGIDO)
    async userHasActivePenalty(id_usuario: number): Promise<boolean> {
        const activePenalty = await this.getRepository().findOne({
            where: [
                {
                    id_usuario,
                    estado: 'ACTIVA',
                    fecha_fin: IsNull()
                },
                {
                    id_usuario,
                    estado: 'ACTIVA',
                    fecha_fin: MoreThan(new Date())
                }
            ]
        });
        return !!activePenalty;
    }

    // Obtener penalizaciones activas de un usuario
    async getActiveUserPenalties(id_usuario: number): Promise<UserPenalty[]> {
        return await this.getRepository().find({
            where: [
                {
                    id_usuario,
                    estado: 'ACTIVA',
                    fecha_fin: IsNull()
                },
                {
                    id_usuario,
                    estado: 'ACTIVA', 
                    fecha_fin: MoreThan(new Date())
                }
            ],
            relations: ['usuario', 'envio']
        });
    }

    // Levantar penalización (para administradores)
    async removePenalty(id_sancion: number): Promise<UserPenalty> {
        const penalty = await this.getUserPenaltyById(id_sancion);
        penalty.estado = 'LEVANTADA';
        penalty.fecha_fin = new Date();
        
        return await this.getRepository().save(penalty);
    }

    // Limpiar penalizaciones expiradas automáticamente
    async cleanupExpiredPenalties(): Promise<number> {
        const result = await this.getRepository()
            .createQueryBuilder()
            .update(UserPenalty)
            .set({ 
                estado: 'EXPIRADA',
                fecha_fin: new Date()
            })
            .where("estado = 'ACTIVA'")
            .andWhere("fecha_fin IS NOT NULL")
            .andWhere("fecha_fin < :currentDate", { currentDate: new Date() })
            .execute();

        return result.affected || 0;
    }
    
    // Obtener penalizaciones por usuario
    async getUserPenaltiesByUser(id_usuario: number): Promise<UserPenalty[]> {
        return await this.getRepository().find({
            where: { id_usuario },
            relations: ['usuario', 'envio'],
            order: { fecha_inicio: 'DESC' }
        });
    }

    // Obtener penalizaciones por envío
    async getUserPenaltiesByShipment(id_envio: number): Promise<UserPenalty[]> {
        return await this.getRepository().find({
            where: { id_envio },
            relations: ['usuario', 'envio']
        });
    }

}