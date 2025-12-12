import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { User } from 'src/entity/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leer qué roles requiere el endpoint (ej: 'Administrador')
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no requiere roles específicos, dejar pasar
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario de la request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    const usuario: User = user;

    // 3. Verificar si el usuario tiene alguno de los roles requeridos
    // Recorremos usuario.userRoles y miramos la propiedad .rol.nombre
    //return requiredRoles.some((role) => 
    //    usuario.userRoles?.some((userRole) => userRole.role.nombre === role)
    ///nuevo
    const normalize = (value?: string) => value?.toString().trim().toUpperCase();

    const requiredNormalized = requiredRoles.map((role) => normalize(role)).filter(Boolean);

    return requiredNormalized.some((role) =>
      usuario.userRoles?.some((userRole) => normalize(userRole.role?.nombre) === role)
    //finnuevo
    );
  }
}