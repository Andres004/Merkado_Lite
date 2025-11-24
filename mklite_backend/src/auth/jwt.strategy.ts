import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraer token del encabezado "Authorization: Bearer <token>"
      ignoreExpiration: false, // Rechazar si expiró
      secretOrKey: 'SEMILLA_SECRETA', // ¡Debe ser la misma que en auth.module.ts!
    });
  }

  // Esta función se ejecuta automáticamente si el token es válido
  async validate(payload: any) {
    // Lo que retornemos aquí se guardará en "request.user"
    return { userId: payload.id, email: payload.email, roles: payload.roles };
  }
}