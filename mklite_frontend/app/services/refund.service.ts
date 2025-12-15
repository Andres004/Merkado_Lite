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

export const getRefundsByDateRange = async (fechaInicio: string, fechaFin: string) => {
  const response = await instance.get('/refunds/date-range', {
    params: { fechaInicio, fechaFin },
  });
  return response.data;
};