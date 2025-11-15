import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { User } from "src/entity/user.entity";
import { UserService } from "./user.service";

@Controller('/user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() user: User) {
        return await this.userService.createUser(user);
    }

    @Get()
    async getAllUser() {
        return await this.userService.getAllUsers();
    }

    @Get('/:id_usuario') 
    async getUserById(@Param('id_usuario') id_usuario: string) {
        return await this.userService.getUserById(Number(id_usuario));
    }

    @Delete('/:id_usuario')
    async deleteUser(@Param('id_usuario') id_usuario: string) {
        return await this.userService.deleteUser(Number(id_usuario));
    }

    @Put('/:id_usuario')
    async updateUser(@Param('id_usuario') id_usuario: string,  @Body() user: User) {
        return await this.userService.updateUser(Number(id_usuario), user);
    }
}
