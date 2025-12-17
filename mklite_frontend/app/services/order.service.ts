import { instance } from "../utils/axios";

// Definimos la estructura exacta que espera tu Backend
export interface CreateOrderPayload {
  id_usuario_cliente: number;
  tipo_pedido: string;     // 'online'
  metodo_pago: string;     // 'efectivo', 'qr', etc.
  direccion_entrega: string;
  tipo_entrega: string;    // 'domicilio' | 'tienda'
  items: {
    id_producto: number;
    cantidad: number;
    precio_unitario?: number;
  }[];
  // Opcionales
  es_reserva?: boolean;
  fecha_hora_programada?: Date;
  subtotal_override?: number;
  total_override?: number;
}

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

// MODIFICADO: Apunta a /order (POST raíz) y tipado correcto
export const createOrderService = async (payload: CreateOrderPayload) => {
  const response = await instance.post('/order', payload);
  return response.data;
};