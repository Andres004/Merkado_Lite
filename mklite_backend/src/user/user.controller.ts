import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Request } from 'express';

@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('ADMIN')
  async createUser(@Body() user: any) {
    return this.userService.createUser(user);
  }

  @Patch('/:id_usuario/set-principal')
  @Roles('ADMIN')
  async setPrincipalAdmin(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Body() body: { status: boolean }
  ) {
    return this.userService.setPrincipalAdmin(id_usuario, body.status);
  }

  @Get()
  @Roles('ADMIN', 'Ventas')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUsers(Number(page), Number(limit), search);
  }

  @Get('/:id_usuario')
  async getUserById(@Param('id_usuario') id_usuario: string) {
    return this.userService.getUserById(Number(id_usuario));
  }

  @Put('/:id_usuario')
  @Roles('ADMIN')
  async updateUser(@Param('id_usuario') id_usuario: string, @Body() userUpdate: Partial<User> & { id_rol?: number }) {
    return this.userService.updateUser(Number(id_usuario), userUpdate);
  }

  @Patch('/:id_usuario/status')
  @Roles('ADMIN')
  async updateStatus(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Body() body: { estado_cuenta: string },
  ) {
    return this.userService.updateStatus(id_usuario, body.estado_cuenta);
  }

  @Delete('/:id_usuario')
  @Roles('ADMIN')
  async deleteUser(@Param('id_usuario') id_usuario: string) {
    return this.userService.deleteUser(Number(id_usuario));
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: Request & { user?: any },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const userId = req.user?.id_usuario;
    return this.userService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}