import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// IMPORTACIONES CLAVE (Asegúrate de que las rutas sean correctas)
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';
import { UserRole } from '../entity/userrole.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    // ESTA LÍNEA ES LA QUE ARREGLA EL ERROR:
    TypeOrmModule.forFeature([User, Role, UserRole]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SEMILLA_SECRETA', // Cambia esto por una variable de entorno en producción
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtStrategy], // Exportamos por si acaso otro módulo lo necesita
})
export class AuthModule {}
