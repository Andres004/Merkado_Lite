// app/models/user.model.ts

export interface RegisterUserDto {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    ci: string;
    telefono: string;
    direccion: string;
  };
}

export interface RoleModel {
  id_rol: number;
  nombre: string;
}

export interface UserRoleModel {
  id_usuario: number;
  id_rol: number;
  role?: RoleModel;
}

export interface UserModel {
  id_usuario?: number;
  nombre: string;
  apellido?: string;
  ci?: string;
  email: string;
  password?: string;
  telefono?: string;
  direccion?: string;
  //estado_cuenta?: 'activo' | 'inactivo';
  accountStatus?: string;
  userRoles?: UserRoleModel[];
}

export interface CreateUserDto {
  nombre: string;
  apellido?: string;
  ci: string;
  email: string;
  password: string;
  id_rol: number;
  estado_cuenta?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  id_rol?: number;
}

export interface PaginatedUsersResponse {
  data: UserModel[];
  total: number;
  page: number;
  limit: number;
}
