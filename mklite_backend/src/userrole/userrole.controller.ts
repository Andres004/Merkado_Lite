import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserRoleService } from './userrole.service';

<<<<<<< HEAD
// DTO simple para la creación
=======
>>>>>>> Backend-andy
class CreateUserroleDto {
    id_usuario: number;
    id_rol: number;
}

@Controller('userrole')
export class UserRoleController {
    constructor(private readonly userroleService: UserRoleService) {}
<<<<<<< HEAD

    
    //Asignar un rol a un usuario
=======
>>>>>>> Backend-andy
    
    @Post()
    async assignRole(@Body() dto: CreateUserroleDto) {
        return this.userroleService.assignRoleToUser(dto);
    }
<<<<<<< HEAD

    
    //Obtener todas las asignaciones
=======
>>>>>>> Backend-andy
    
    @Get()
    async getAllAssignments() {
        return this.userroleService.getAllAssignments();
    }
<<<<<<< HEAD

    
    //Obtener los roles de un usuario específico
=======
>>>>>>> Backend-andy
    
    @Get('/user/:id_usuario')
    async getRolesForUser(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
        return this.userroleService.getRolesForUser(id_usuario);
    }
<<<<<<< HEAD

    
    //Obtener los usuarios de un rol específico
=======
>>>>>>> Backend-andy
    
    @Get('/role/:id_rol')
    async getUsersByRole(@Param('id_rol', ParseIntPipe) id_rol: number) {
        return this.userroleService.getUsersByRole(id_rol);
    }
<<<<<<< HEAD

    
    //Quitar un rol a un usuario
=======
>>>>>>> Backend-andy
    
    @Delete('/:id_usuario/:id_rol')
    async removeRole(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
        @Param('id_rol', ParseIntPipe) id_rol: number
    ) {
        return this.userroleService.removeRoleFromUser(id_usuario, id_rol);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> Backend-andy
