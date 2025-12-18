import { instance } from "../utils/axios";
import { ProductModel } from "../models/product.model";
import { DiscountModel } from "../models/discount.model";

export const fetchProductsForSale = async (): Promise<ProductModel[]> => {
  const response = await instance.get<ProductModel[]>("/product");
  return response.data;
};

export const fetchDiscounts = async (): Promise<DiscountModel[]> => {
  const response = await instance.get<DiscountModel[]>("/discount");
  return response.data;
};

export const fetchProductCategories = async () => {
  const response = await instance.get("/productcategory");
  return response.data as Array<{ id_producto: number; id_categoria: number; categoria?: { id_categoria: number; nombre: string } }>;
};

export const validateCouponCode = async (code: string): Promise<DiscountModel> => {
  const response = await instance.get<DiscountModel>(`/discount/code/${code}`);
  return response.data;
};

export const createSale = async (payload: any) => {
  const response = await instance.post("/order", payload);
  return response.data;
};