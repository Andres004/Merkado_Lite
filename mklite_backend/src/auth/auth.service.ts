import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt'; // Agregamos 'compare'
import { JwtService } from '@nestjs/jwt'; // servicio de JWT
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';
import { UserRole } from '../entity/userrole.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto'; // DTO

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(UserRole)
        private userRoleRepository: Repository<UserRole>,
        private jwtService: JwtService, //Inyectamos el servicio de JWT
    ) {}

   
    async register(userObject: RegisterAuthDto) {
        
        const { email, password, ci } = userObject;
        const userExists = await this.usersRepository.findOne({ where: [{ email }, { ci }] });
        if (userExists) throw new HttpException('El usuario ya existe (Email o CI duplicado)', HttpStatus.CONFLICT);
        const plainToHash = await hash(password, 10);
        userObject.password = plainToHash;
        const newUser = this.usersRepository.create(userObject);
        const userSaved = await this.usersRepository.save(newUser) as User;
        const roleCliente = await this.roleRepository.findOne({ where: { nombre: 'Cliente' } });
        if (!roleCliente) throw new HttpException('Error interno: El rol Cliente no existe en la BD', HttpStatus.INTERNAL_SERVER_ERROR);
        const newUserRole = this.userRoleRepository.create({ id_usuario: userSaved.id_usuario, id_rol: roleCliente.id_rol });
        await this.userRoleRepository.save(newUserRole);
        return { message: 'Usuario registrado exitosamente', user: { id: userSaved.id_usuario, email: userSaved.email, nombre: userSaved.nombre } };
    }

    //FUNCIÓN LOGIN
    async login(loginDto: LoginAuthDto) {
        const { email, password } = loginDto;

        // 1. Buscar usuario
        const userFound = await this.usersRepository.findOne({ 
            where: { email },
            // necesitamos cargar los roles para meterlos en el token
            relations: ['userRoles', 'userRoles.rol'] 
        });

        if (!userFound) {
            throw new HttpException('Credenciales inválidas (Usuario no encontrado)', HttpStatus.UNAUTHORIZED);
        }

        // 2. Verificar contraseña
        const isPasswordValid = await compare(password, userFound.password);
        if (!isPasswordValid) {
            throw new HttpException('Credenciales inválidas (Contraseña incorrecta)', HttpStatus.UNAUTHORIZED);
        }

        // 3. Generar el Token (Payload = Información que viaja dentro del carnet)
        // Extraemos los nombres de los roles para ponerlos en el token
        const roles = userFound.userRoles.map(ur => ur.rol.nombre);

        const payload = { 
            id: userFound.id_usuario, 
            email: userFound.email, 
            nombre: userFound.nombre,
            roles: roles 
        };

        const token = this.jwtService.sign(payload);

        return {
            message: 'Login exitoso',
            user: {
                id: userFound.id_usuario,
                email: userFound.email,
                nombre: userFound.nombre,
                roles: roles
            },
            token: token // AQUÍ ES DONDE DEVOLVEMOS EL TOKEN
        };
    }
}