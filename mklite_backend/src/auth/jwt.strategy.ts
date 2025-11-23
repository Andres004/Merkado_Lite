import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service'; // Importar UserService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) { // Inyectar servicio
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CLAVE_SECRETA_SUPER_SEGURA', 
    });
  }

  async validate(payload: any) {
    // Buscamos el usuario completo CON sus roles
    const user = await this.userService.getUserById(payload.sub);
    
    if (!user) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Esto inyecta el usuario completo (con roles) en req.user
    return user; 
  }
}