import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPenaltyService } from '../userpenalty/userpenalty.service';
import { User } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport'; // El guardia base de JWT
import { RolesGuard } from 'src/auth/roles.guard'; // Tu guardia nuevo
import { Roles } from 'src/auth/roles.decorator'; // Tu decorador
import { NotFoundException } from '@nestjs/common';

@Controller('user')
// 1. PROTECCIÓN GLOBAL: Nadie entra aquí sin Token
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userPenaltyService: UserPenaltyService,
    ) {}

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

    @Get('blocked')
    async findBlocked() {
        return await this.userService.getBlockedUsers();
    }

    @Get('with-penalties')
    async findWithPenalties() {
        return await this.userService.getUsersWithActivePenalties(this.userPenaltyService);
    }

    @Get(':id')
    async findOne(@Param('id') id_usuario: number) {
        return await this.userService.getUserById(id_usuario);
    }

    @Put(':id')
    async update(@Param('id') id_usuario: number, @Body() updateData: Partial<User>) {
        return await this.userService.updateUser(id_usuario, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id_usuario: number) {
        return await this.userService.deleteUser(id_usuario);
    }

    @Put(':id/block')
    async blockUser(@Param('id') id_usuario: number) {
        return await this.userService.blockUser(id_usuario);
    }

    @Put(':id/unblock')
    async unblockUser(@Param('id') id_usuario: number) {
        return await this.userService.unblockUser(id_usuario);
    }

    @Put(':id/change-password')
    async changePassword(@Param('id') id_usuario: number, @Body() body: { newPassword: string }) {
        return await this.userService.changePassword(id_usuario, body.newPassword);
    }

    @Get('email/:email')
    async findByEmail(@Param('email') email: string) {
        return await this.userService.getUserByEmail(email);
    }

    @Post('validate')
    async validateUser(@Body() body: { email: string; password: string }) {
        const user = await this.userService.validateUser(body.email, body.password);
        if (!user) {
            throw new NotFoundException('Credenciales inválidas');
        }
        return user;
    }

    @Get(':id/can-purchase')
    async canUserPurchase(@Param('id') id_usuario: number) {
        const canPurchase = await this.userService.canUserMakePurchase(id_usuario, this.userPenaltyService);
        return { canPurchase };
    }
}