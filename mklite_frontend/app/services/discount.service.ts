import api from '../utils/axios';
import { CreateDiscountDto, DiscountModel } from '../models/discount.model';

const DISCOUNT_URL = '/discount';

export const getDiscounts = async (): Promise<DiscountModel[]> => {
    const response = await api.get<DiscountModel[]>(DISCOUNT_URL);
    return response.data;
};

export const createDiscount = async (dto: CreateDiscountDto): Promise<DiscountModel> => {
    const response = await api.post<DiscountModel>(DISCOUNT_URL, dto);
    return response.data;
};

export const updateDiscount = async (id: number, dto: Partial<CreateDiscountDto>): Promise<DiscountModel> => {
    const response = await api.put<DiscountModel>(`${DISCOUNT_URL}/${id}`, dto);
    return response.data;
};

export const deleteDiscount = async (id: number): Promise<void> => {
    await api.delete(`${DISCOUNT_URL}/${id}`);
};