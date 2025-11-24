// user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPenaltyService } from '../userpenalty/userpenalty.service';
import { User } from 'src/entity/user.entity';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userPenaltyService: UserPenaltyService,
    ) {}

    @Post()
    async create(@Body() userData: Partial<User>) {
        const user = Object.assign(new User(), userData);
        return await this.userService.createUser(user);
    }

    @Get()
    async findAll() {
        return await this.userService.getAllUsers();
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