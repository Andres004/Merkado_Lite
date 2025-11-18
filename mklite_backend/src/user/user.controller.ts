import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: User) {
    return this.userService.createUser(user);
  }

  @Get() //get all
  async getAllUsers() {
    return this.userService.getAllUsers();
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
  async deleteUser(@Param('id_usuario') id_usuario: string) {
    return this.userService.deleteUser(Number(id_usuario));
  }
}
