// app/models/user.model.tsx

// Interfaz para registrar un usuario (Coincide con tu Backend)
export interface RegisterUserDto {
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

// Interfaz para hacer Login
export interface LoginDto {
  email: string;
  password: string;
}

// Lo que devuelve el backend al loguearse
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
    // ... otros campos si los necesitas
  };
}

// Interfaz general de Usuario para el resto de la app
export default interface UserModel {
    id_usuario?: number;
    nombre: string;
    apellido: string;
    ci: string;
    email: string;
    password?: string;
    telefono?: string;
    direccion?: string;
}