import api from '../utils/axios';
import { CategoryModel } from '../models/product.model';

const CATEGORY_URL = '/category';

export const getAllCategories = async (): Promise<CategoryModel[]> => {
  try {
    const response = await api.get<CategoryModel[]>(CATEGORY_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};