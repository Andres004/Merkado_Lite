import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  // 1. Validar usuario y contraseña
  /*
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmailForAuth(email);
    
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result; 
    }
    return null;
  }
   */

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmailForAuth(email);
    
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;

      // Sacamos el rol principal desde la relación usuario_rol -> rol
      const mainRole =
        user.userRoles?.[0]?.role?.nombre ?? 'CLIENTE'; // por si no tuviera nada

      return {
        ...result,
        rol: mainRole, // <- AQUÍ se define el rol que verá el front
      };
    }
    return null;
  }


  // 2. Login (Directo, genera token inmediatamente)
  async login(user: any) {
    return this.generateAccessToken(user);
  }

  // 3. Registro (Puente al servicio de usuarios)
  async register(userData: any) {
    return this.userService.registerUser(userData);
  }

  // Auxiliar: Generar JWT
  /*
  private generateAccessToken(user: any) {
    const payload = { email: user.email, sub: user.id_usuario };
    return {
      access_token: this.jwtService.sign(payload),
      user: user
    };
  }
   */

  private generateAccessToken(user: any) {
  const payload = { 
    email: user.email, 
    sub: user.id_usuario,
    rol: user.rol, // opcional, pero útil
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: user,
  };
}

}