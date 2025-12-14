import { instance } from "../utils/axios";

export const getOrders = async (estado?: string) => {
  const response = await instance.get('/order', {
    params: estado ? { estado } : undefined,
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