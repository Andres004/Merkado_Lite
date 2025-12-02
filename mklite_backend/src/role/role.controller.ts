import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from 'src/entity/role.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() role: Role) {
    return this.roleService.createRole(role);
  }

  @Get()
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get('/:id_rol')
  async getRoleById(@Param('id_rol') id_rol: string) {
    return this.roleService.getRoleById(Number(id_rol));
  }

  @Put('/:id_rol')
  async updateRole(@Param('id_rol') id_rol: string, @Body() roleUpdate: Partial<Role>) {
    return this.roleService.updateRole(Number(id_rol), roleUpdate);
  }

  @Delete('/:id_rol')
  async deleteRole(@Param('id_rol') id_rol: string) {
    return this.roleService.deleteRole(Number(id_rol));
  }
}
