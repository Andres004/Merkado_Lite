<<<<<<< HEAD
// user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException } from '@nestjs/common';
=======
import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
>>>>>>> Backend-andy
import { UserService } from './user.service';
import { UserPenaltyService } from '../userpenalty/userpenalty.service';
import { User } from 'src/entity/user.entity';
import { AuthGuard } from '@nestjs/passport'; // El guardia base de JWT
import { RolesGuard } from 'src/auth/roles.guard'; // Tu guardia nuevo
import { Roles } from 'src/auth/roles.decorator'; // Tu decorador

<<<<<<< HEAD
@Controller('users')
=======
@Controller('user')
// 1. PROTECCIÓN GLOBAL: Nadie entra aquí sin Token
@UseGuards(AuthGuard('jwt'), RolesGuard) 
>>>>>>> Backend-andy
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userPenaltyService: UserPenaltyService,
    ) {}

<<<<<<< HEAD
    @Post()
    async create(@Body() userData: Partial<User>) {
        const user = Object.assign(new User(), userData);
        return await this.userService.createUser(user);
    }

    @Get()
    async findAll() {
        return await this.userService.getAllUsers();
    }
=======
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
>>>>>>> Backend-andy

    @Get('blocked')
    async findBlocked() {
        return await this.userService.getBlockedUsers();
    }

    @Get('with-penalties')
    async findWithPenalties() {
        return await this.userService.getUsersWithActivePenalties(this.userPenaltyService);
    }

<<<<<<< HEAD
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
=======
  @Delete('/:id_usuario')
  @Roles('Administrador')
  async deleteUser(@Param('id_usuario') id_usuario: string) {
    return this.userService.deleteUser(Number(id_usuario));
  }
>>>>>>> Backend-andy
}