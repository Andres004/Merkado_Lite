import { instance } from "../utils/axios";

export const getRefunds = async () => {
  const response = await instance.get('/refunds');
  return response.data;
};

export const createRefund = async (payload: any) => {
  const response = await instance.post('/refunds', payload);
  return response.data;
};

export const createRefundItem = async (payload: any) => {
  const response = await instance.post('/refundItems', payload);
  return response.data;
};