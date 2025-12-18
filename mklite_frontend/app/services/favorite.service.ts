import { FavoriteModel } from "../models/favorite.model";
import { instance } from "../utils/axios";

export const getMyFavorites = async () => {
  const response = await instance.get<FavoriteModel[]>("/favorite/me");
  return response.data;
};

export const addFavorite = async (id_producto: number) => {
  const response = await instance.post<FavoriteModel>("/favorite", { id_producto });
  return response.data;
};

export const removeFavorite = async (id_producto: number) => {
  const response = await instance.delete<{ message: string }>(`/favorite/${id_producto}`);
  return response.data;
};