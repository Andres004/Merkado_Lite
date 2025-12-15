import { CreateUserDto, PaginatedUsersResponse, UpdateUserDto, UserModel } from "../models/user.model";
import { instance } from "../utils/axios";

export const fetchCurrentUser = async () => {
  const response = await instance.get<UserModel>('/user/profile');
  return response.data;
};

export const updateCurrentUser = async (user: Partial<UserModel>) => {
  const response = await instance.patch<UserModel>('/user/profile', user);
  return response.data;
};


export const getUsers = async (params?: { page?: number; limit?: number; search?: string }) => {
    const users = await instance.get<PaginatedUsersResponse>('/user', { params });
    return users.data;
};

export const createUser = async (user: CreateUserDto) => {
    const newUser = await instance.post<UserModel>('/user', user);
    return newUser.data;
};

export const deleteUser = async (id_usuario: number) => {
    const deletedUser = await instance.delete(`/user/${id_usuario}`);
    return deletedUser.data;
};

export const updateUser = async (id_usuario: number, user: UpdateUserDto) => {
    const updatedUser = await instance.put<UserModel>(`/user/${id_usuario}`, user);
    return updatedUser.data;
};

export const updateUserStatus = async (id_usuario: number, estado_cuenta: string) => {
    const response = await instance.patch<UserModel>(`/user/${id_usuario}/status`, { estado_cuenta });
    return response.data;
};

export const getUserById = async (id_usuario: number) => {
  const response = await instance.get<UserModel>(`/user/${id_usuario}`);
  return response.data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await instance.patch('/user/change-password', payload);
  return response.data;
};