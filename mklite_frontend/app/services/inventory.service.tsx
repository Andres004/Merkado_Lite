// app/services/inventory.service.ts
import { instance } from "../utils/axios";
import { InventoryModel, CreateBatchDto, SupplierModel, ProductShort } from "../models/inventory.model";

// Obtener todo el inventario (Para la tabla)
export const getAllInventoryService = async (): Promise<InventoryModel[]> => {
  const response = await instance.get('/inventory');
  return response.data;
};

// Actualizar solo el umbral (Editar Umbral)
export const updateThresholdService = async (id_producto: number, nuevoMinimo: number) => {
  const response = await instance.post(`/inventory/${id_producto}`, {
    stock_minimo: nuevoMinimo
  });
  return response.data;
};

// Registrar nuevo lote (Botón Rojo)
export const createBatchService = async (data: CreateBatchDto) => {
  const response = await instance.post('/batch', data);
  return response.data;
};

// Auxiliares para llenar los selects del formulario
export const getProductsListService = async (): Promise<ProductShort[]> => {
  const response = await instance.get('/product');
  return response.data;
};

export const getSuppliersListService = async (): Promise<SupplierModel[]> => {
  const response = await instance.get('/supplier');
  return response.data;
};