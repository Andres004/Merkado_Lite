import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { User } from "src/entity/user.entity";
import { UserRole } from "src/entity/userrole.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    private userRepository: Repository<User>;
    private userRoleRepository: Repository<UserRole>;

    constructor() {
       this.initRepositories();
    }

    private initRepositories() {
        if (AppDataSource.isInitialized) {
            this.userRepository = AppDataSource.getRepository(User);
            this.userRoleRepository = AppDataSource.getRepository(UserRole);
        }
    }

    private getUserRepo(): Repository<User> {
        if (!this.userRepository) this.initRepositories();
        if (!this.userRepository) throw new Error('DataSource no inicializado');
        return this.userRepository;
    }

    // --- CREATE USER (Registro) ---
    async registerUser(userData: Partial<User>): Promise<User> {
        const repo = this.getUserRepo();
        
        if (!userData.password) {
            throw new BadRequestException('La contraseña es obligatoria');
        }

        if (!userData.email) {
            throw new BadRequestException('El email es obligatorio');
        }

        const existing = await repo.findOneBy({ email: userData.email });
        if (existing) throw new ConflictException('El correo ya está registrado');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = repo.create({
            ...userData,
            password: hashedPassword
        } as User); 
        
        const savedUser = await repo.save(newUser);

        if (this.userRoleRepository) {
            const userRole = this.userRoleRepository.create({
                id_usuario: savedUser.id_usuario,
                id_rol: 1 
            });
            await this.userRoleRepository.save(userRole);
        }

        delete (savedUser as any).password;
        return savedUser;
    }

    // --- LOGIN ---
    async findByEmailForAuth(email: string): Promise<User | undefined> {
        const repo = this.getUserRepo();
        const user = await repo.createQueryBuilder("user")
            .addSelect("user.password") 
            .where("user.email = :email", { email })
            .getOne();
        
        return user || undefined; 
    }

    // --- FIND ONE (Genérico) ---
    async findOne(id: number): Promise<User> {
        const user = await this.getUserRepo().findOneBy({ id_usuario: id });
        if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
        return user;
    }

    async createUser(user: User) { 
        return await this.getUserRepo().save(user);
    }

    // Obtener todos los usuarios con paginacion
    async getAllUsers(page: number = 1, limit: number = 10) {
        const repo = this.getUserRepo();
        const skip = (page - 1) * limit;

        const [users, total] = await repo.findAndCount({
            relations: ['userRoles', 'userRoles.role'],
            skip: skip,
            take: limit,
        });

        return {
            data: users,
            meta: {
                totalItems: total,
                itemCount: users.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }
    
    async getUserById(id_usuario: number): Promise<User> {
        const user = await this.getUserRepo().findOne({
            where: { id_usuario },
            relations: ['userRoles', 'userRoles.role'],
        });
        if (!user) throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);
        return user;
    }

    async deleteUser(id_usuario: number) {
        const result = await this.getUserRepo().delete(id_usuario);
        if (result.affected === 0) throw new NotFoundException(`Usuario no encontrado`);
        return { message: `Usuario eliminado` };
    }

    async updateUser(id_usuario: number, userUpdate: Partial<User>) {
        await this.getUserRepo().update(id_usuario, userUpdate);
        return this.getUserById(id_usuario);
    }
}