import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { User } from "src/entity/user.entity";
import { UserRole } from "src/entity/userrole.entity";
import { Role } from "src/entity/role.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

interface CreateUserPayload {
    nombre: string;
    apellido?: string;
    email: string;
    password: string;
    ci?: string;
    telefono?: string;
    direccion?: string;
    id_rol: number;
    estado_cuenta?: string;
}

interface UpdateUserPayload {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    ci?: string;
    telefono?: string;
    direccion?: string;
    id_rol?: number;
}

@Injectable()
export class UserService {
    private userRepository: Repository<User>;
    private userRoleRepository: Repository<UserRole>;
    private roleRepository: Repository<Role>;

    constructor() {
        this.initRepositories();
    }

    private initRepositories() {
        if (AppDataSource.isInitialized) {
            this.userRepository = AppDataSource.getRepository(User);
            this.userRoleRepository = AppDataSource.getRepository(UserRole);
            this.roleRepository = AppDataSource.getRepository(Role);
        }
    }

    private getUserRepo(): Repository<User> {
        if (!this.userRepository) this.initRepositories();
        if (!this.userRepository) throw new Error('DataSource no inicializado');
        return this.userRepository;
    }

    private getUserRoleRepo(): Repository<UserRole> {
        if (!this.userRoleRepository) this.initRepositories();
        if (!this.userRoleRepository) throw new Error('DataSource no inicializado');
        return this.userRoleRepository;
    }

    private getRoleRepo(): Repository<Role> {
        if (!this.roleRepository) this.initRepositories();
        if (!this.roleRepository) throw new Error('DataSource no inicializado');
        return this.roleRepository;
    }

    private async assignRoleToUser(userId: number, roleId: number) {
        const role = await this.getRoleRepo().findOne({ where: { id_rol: roleId } });
        if (!role) {
            throw new NotFoundException('El rol especificado no existe');
        }

        const userRoleRepo = this.getUserRoleRepo();
        await userRoleRepo.delete({ id_usuario: userId });

        const userRole = userRoleRepo.create({ id_usuario: userId, id_rol: roleId });
        await userRoleRepo.save(userRole);
    }

    // --- CREATE USER (Registro) ---
    async registerUser(userData: Partial<User>): Promise<User> {
        const repo = this.getUserRepo();

        if (!userData.password) throw new BadRequestException('La contraseña es obligatoria');
        if (!userData.email) throw new BadRequestException('El email es obligatorio');

        const existing = await repo.findOneBy({ email: userData.email });
        if (existing) throw new ConflictException('El correo ya está registrado');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = repo.create({
            ...userData,
            password: hashedPassword,
            esAdminPrincipal: false,
            accountStatus: userData.accountStatus || 'activo',
        } as User);

        const savedUser = await repo.save(newUser);

        await this.assignRoleToUser(savedUser.id_usuario, 1);

        delete (savedUser as any).password;
        return savedUser;
    }

    // --- FUNCIONALIDAD COMPLETA: Designar Admin Principal ---
    async setPrincipalAdmin(id_usuario: number, status: boolean): Promise<User> {
        const user = await this.findOne(id_usuario);

        user.esAdminPrincipal = status;

        if (status === true) {
            let adminRole = await this.getRoleRepo().findOneBy({ nombre: 'ADMIN' });

            if (!adminRole) {
                adminRole = this.getRoleRepo().create({ nombre: 'ADMIN' });
                adminRole = await this.getRoleRepo().save(adminRole);
            }

            const existingAssignment = await this.getUserRoleRepo().findOneBy({
                id_usuario: user.id_usuario,
                id_rol: adminRole.id_rol,
            });

            if (!existingAssignment) {
                const newAssignment = this.getUserRoleRepo().create({
                    id_usuario: user.id_usuario,
                    id_rol: adminRole.id_rol,
                });
                await this.getUserRoleRepo().save(newAssignment);
            }
        }

        return await this.getUserRepo().save(user);
    }

    // --- LOGIN ---
    async findByEmailForAuth(email: string): Promise<User | undefined> {
        const repo = this.getUserRepo();

        const user = await repo
            .createQueryBuilder("user")
            .addSelect("user.password")
            .leftJoinAndSelect("user.userRoles", "userrole")
            .leftJoinAndSelect("userrole.role", "role")
            .where("user.email = :email", { email })
            .getOne();

        return user || undefined;
    }

    // --- CRUD ESTÁNDAR ---
    async findOne(id: number): Promise<User> {
        const user = await this.getUserRepo().findOne({ where: { id_usuario: id } });
        if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
        return user;
    }

    async createUser(userData: CreateUserPayload) {
        const repo = this.getUserRepo();

        if (!userData.password) throw new BadRequestException('La contraseña es obligatoria');
        if (!userData.email) throw new BadRequestException('El email es obligatorio');

        const existing = await repo.findOneBy({ email: userData.email });
        if (existing) throw new ConflictException('El correo ya está registrado');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = repo.create({
            nombre: userData.nombre,
            apellido: userData.apellido || '',
            email: userData.email,
            password: hashedPassword,
            ci: userData.ci,
            telefono: userData.telefono,
            direccion: userData.direccion,
            accountStatus: userData.estado_cuenta || 'activo',
            esAdminPrincipal: false,
        });

        const savedUser = await repo.save(newUser);
        await this.assignRoleToUser(savedUser.id_usuario, userData.id_rol);

        return this.getUserById(savedUser.id_usuario);
    }

    async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
        const repo = this.getUserRepo();
        const skip = (page - 1) * limit;

        const query = repo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .skip(skip)
            .take(limit)
            .orderBy('user.nombre', 'ASC');

        if (search) {
            query.where('LOWER(user.nombre) LIKE :search OR LOWER(user.email) LIKE :search', {
                search: `%${search.toLowerCase()}%`,
            });
        }

        const [users, total] = await query.getManyAndCount();

        return {
            data: users,
            total,
            page,
            limit,
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

       async getProfile(id_usuario: number) {
        return this.getUserById(id_usuario);
    }


    async deleteUser(id_usuario: number) {
        const result = await this.getUserRepo().delete(id_usuario);
        if (result.affected === 0) throw new NotFoundException(`Usuario no encontrado`);
        return { message: `Usuario eliminado` };
    }

    async updateUser(id_usuario: number, userUpdate: UpdateUserPayload) {
        const repo = this.getUserRepo();
        const user = await repo.findOneBy({ id_usuario });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        if (userUpdate.email && userUpdate.email !== user.email) {
            const existing = await repo.findOne({ where: { email: userUpdate.email } });
            if (existing && existing.id_usuario !== id_usuario) {
                throw new ConflictException('El correo ya está en uso');
            }
        }

        if (userUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(userUpdate.password, salt);
        }

        user.nombre = userUpdate.nombre ?? user.nombre;
        user.apellido = userUpdate.apellido ?? user.apellido;
        user.email = userUpdate.email ?? user.email;
        user.ci = userUpdate.ci ?? user.ci;
        user.telefono = userUpdate.telefono ?? user.telefono;
        user.direccion = userUpdate.direccion ?? user.direccion;

        await repo.save(user);

        if (userUpdate.id_rol !== undefined) {
            await this.assignRoleToUser(user.id_usuario, userUpdate.id_rol);
        }

        return this.getUserById(id_usuario);
    }

        async updateProfile(id_usuario: number, userUpdate: UpdateUserPayload) {
        const repo = this.getUserRepo();
        const user = await repo.findOneBy({ id_usuario });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        if (userUpdate.email && userUpdate.email !== user.email) {
            const existing = await repo.findOne({ where: { email: userUpdate.email } });
            if (existing && existing.id_usuario !== id_usuario) {
                throw new ConflictException('El correo ya está en uso');
            }
        }

        user.nombre = userUpdate.nombre ?? user.nombre;
        user.apellido = userUpdate.apellido ?? user.apellido;
        user.email = userUpdate.email ?? user.email;
        user.ci = userUpdate.ci ?? user.ci;
        user.telefono = userUpdate.telefono ?? user.telefono;
        user.direccion = userUpdate.direccion ?? user.direccion;

        await repo.save(user);

        return this.getUserById(id_usuario);
    }


    async changePassword(id_usuario: number, currentPassword: string, newPassword: string) {
        if (!id_usuario) throw new BadRequestException('Usuario no válido');
        if (!currentPassword || !newPassword) throw new BadRequestException('Campos incompletos');
        if (newPassword.length < 8) throw new BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');

        const repo = this.getUserRepo();

        const user = await repo
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id_usuario = :id', { id: id_usuario })
            .getOne();

        if (!user) throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) throw new UnauthorizedException('Contraseña actual incorrecta');

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await repo.save(user);

        return { message: 'Contraseña actualizada correctamente' };
    }

    async updateStatus(id_usuario: number, estado_cuenta: string) {
        const allowedStatuses = ['activo', 'inactivo'];
        if (!allowedStatuses.includes(estado_cuenta)) {
            throw new BadRequestException('Estado no válido');
        }

        const repo = this.getUserRepo();
        const user = await repo.findOneBy({ id_usuario });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        user.accountStatus = estado_cuenta;
        await repo.save(user);

        return this.getUserById(id_usuario);
    }
}