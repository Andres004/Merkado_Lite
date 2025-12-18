import { instance } from "../utils/axios";

export const downloadInvoiceService = async (orderId: number) => {
  return instance.get(`/order/${orderId}/invoice`, { responseType: 'blob' });
};

export const sendInvoiceEmailService = async (orderId: number, email?: string) => {
  return instance.post(`/order/${orderId}/invoice/email`, { email });
};