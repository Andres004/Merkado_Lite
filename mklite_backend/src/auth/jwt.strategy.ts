import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CLAVE_SECRETA_SUPER_SEGURA', // EN PRODUCCION USAR VARIABLES DE ENTORNO (.ENV)
    });
  }

  async validate(payload: any) {
    // Esto inyecta el usuario en el objeto request (req.user)
    return { id_usuario: payload.sub, email: payload.email };
  }
}