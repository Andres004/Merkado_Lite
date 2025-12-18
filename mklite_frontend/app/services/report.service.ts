import { instance } from "../utils/axios";

const buildParams = (date?: string, estado?: string) => {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  if (estado) params.estado = estado;
  return params;
};

export const fetchDailyReport = async (date?: string, estado?: string) => {
  const response = await instance.get('/admin/reports/daily', {
    params: buildParams(date, estado),
  });
  return response.data;
};

export const downloadDailyPdf = async (date?: string, estado?: string) => {
  const response = await instance.get('/admin/reports/daily.pdf', {
    params: buildParams(date, estado),
    responseType: 'blob',
  });
  return response.data as Blob;
};

export const downloadDailyOrdersCsv = async (date?: string, estado?: string) => {
  const response = await instance.get('/admin/reports/daily-orders.csv', {
    params: buildParams(date, estado),
    responseType: 'blob',
  });
  return response.data as Blob;
};

export const downloadDailyInventoryCsv = async (date?: string, estado?: string) => {
  const response = await instance.get('/admin/reports/daily-inventory.csv', {
    params: buildParams(date, estado),
    responseType: 'blob',
  });
  return response.data as Blob;
};