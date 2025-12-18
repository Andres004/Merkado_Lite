import { RoleModel } from "../models/user.model";
import { instance } from "../utils/axios";

export const getRoles = async () => {
    const response = await instance.get<RoleModel[]>('/role');
    return response.data;
};
