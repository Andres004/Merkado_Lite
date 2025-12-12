import UserModel from "../models/user.model";
import { instance } from "../utils/axios"

export const getUsers = async () => {
    const users = await instance.get('/user');
    return users.data;
}

export const createUser = async (user: Partial<UserModel>) => {
    const newUser = await instance.post('/user', user);
    return newUser.data;
}

export const deleteUser = async (ci: string) => {
    const deletedUser = await instance.delete(`/user/${ci}`);
    return deletedUser.data;
}

export const updateUser = async (ci: string, user: any) => {
    const updatedUser = await instance.put(`/user/${ci}`, user);
    return updatedUser.data;
}


export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await instance.patch('/user/change-password', payload);
  return response.data;
};