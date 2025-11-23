import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserRoleService } from './userrole.service';

class CreateUserroleDto {
    id_usuario: number;
    id_rol: number;
}

@Controller('userrole')
export class UserRoleController {
    constructor(private readonly userroleService: UserRoleService) {}
    
    @Post()
    async assignRole(@Body() dto: CreateUserroleDto) {
        return this.userroleService.assignRoleToUser(dto);
    }
    
    @Get()
    async getAllAssignments() {
        return this.userroleService.getAllAssignments();
    }
    
    @Get('/user/:id_usuario')
    async getRolesForUser(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.userroleService.getRolesForUser(id_usuario);
    }
    
    @Get('/role/:id_rol')
    async getUsersByRole(@Param('id_rol', ParseIntPipe) id_rol: number) {
        return this.userroleService.getUsersByRole(id_rol);
    }
    
    @Delete('/:id_usuario/:id_rol')
    async removeRole(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_rol', ParseIntPipe) id_rol: number
    ) {
        return this.userroleService.removeRoleFromUser(id_usuario, id_rol);
    }
}