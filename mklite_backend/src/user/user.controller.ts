//import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport'; // El guardia base de JWT
import { RolesGuard } from 'src/auth/roles.guard'; // Tu guardia nuevo
import { Roles } from 'src/auth/roles.decorator'; // Tu decorador
import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('user')
// 1. PROTECCIÓN GLOBAL: Nadie entra aquí sin Token
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Solo un Admin puede crear usuarios directamente (o quitar este endpoint si solo usas /auth/register)
  @Post()
  @Roles('Administrador') 
  async createUser(@Body() user: User) {
    return this.userService.createUser(user);
  }

  // Solo un Admin puede promover a otro Admin (HU-F22)
  @Patch('/:id_usuario/set-principal')
  @Roles('Administrador')
  async setPrincipalAdmin(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Body() body: { status: boolean }
  ) {
    return this.userService.setPrincipalAdmin(id_usuario, body.status);
  }

  // Admin y Ventas pueden ver usuarios
  @Get() 
  @Roles('Administrador', 'Ventas')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getAllUsers(Number(page), Number(limit));
  }

  @Get('/:id_usuario')
  async getUserById(@Param('id_usuario') id_usuario: string) {
    return this.userService.getUserById(Number(id_usuario));
  }

  @Put('/:id_usuario')
  async updateUser(@Param('id_usuario') id_usuario: string, @Body() userUpdate: Partial<User>) {
    return this.userService.updateUser(Number(id_usuario), userUpdate);
  }

  @Delete('/:id_usuario')
  @Roles('Administrador')
  async deleteUser(@Param('id_usuario') id_usuario: string) {
    return this.userService.deleteUser(Number(id_usuario));
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: Request & { user?: any },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    // JwtStrategy devuelve el usuario completo, así que aquí existe req.user.id_usuario
    const userId = req.user?.id_usuario;
    return this.userService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}