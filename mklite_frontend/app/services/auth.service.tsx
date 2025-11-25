// app/services/auth.service.tsx
import { instance } from "../utils/axios";
import { LoginDto, RegisterUserDto, AuthResponse } from "../models/user.model";

// Función para conectar con el Backend (Login)
export const loginService = async (credentials: LoginDto): Promise<AuthResponse> => {
  // Esto llama a http://localhost:3005/auth/login
  const response = await instance.post('/auth/login', credentials);
  return response.data; 
};

// Función para conectar con el Backend (Registro)
export const registerService = async (userData: RegisterUserDto) => {
  // Esto llama a http://localhost:3005/auth/register
  const response = await instance.post('/auth/register', userData);
  return response.data;
};