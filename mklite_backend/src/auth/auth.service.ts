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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmailForAuth(email);

    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      if (user.accountStatus && user.accountStatus.toLowerCase() !== 'activo') {
        throw new UnauthorizedException('La cuenta está inactiva');
      }

      const { password, ...result } = user;

      const mainRole =
        user.userRoles?.[0]?.role?.nombre ?? 'CLIENTE';

      return {
        ...result,
        rol: mainRole,
      };
    }
    return null;
  }

  async login(user: any) {
    return this.generateAccessToken(user);
  }

  async register(userData: any) {
    return this.userService.registerUser(userData);
  }

  private generateAccessToken(user: any) {
  const payload = {
    email: user.email,
    sub: user.id_usuario,
    rol: user.rol,
  };

  return {
    access_token: this.jwtService.sign(payload),
    user: user,
  };
}

}