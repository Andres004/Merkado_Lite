import { instance } from "../utils/axios";

export const getOrders = async (params?: { estado?: string; fecha?: string }) => {
  const response = await instance.get('/order', {
    params,
  });
  return response.data;
};

export const getMyOrders = async (params?: { page?: number; limit?: number }) => {
  const response = await instance.get('/order/my', {
    params,
  });
  return response.data;
};

export const getOrderDetail = async (id_pedido: number) => {
  const response = await instance.get(`/order/${id_pedido}`);
  return response.data;
};

export const cancelOrder = async (id_pedido: number) => {
  const response = await instance.patch(`/order/${id_pedido}/cancel`);
  return response.data;
};

export const createCheckoutOrder = async (payload: any) => {
  const response = await instance.post('/order/checkout', payload);
  return response.data;
};