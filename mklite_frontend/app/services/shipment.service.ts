import { instance } from "../utils/axios";

export const getAssignedShipments = async (repartidorId: number, estado?: string) => {
  const response = await instance.get(`/shipment/driver/${repartidorId}`, {
    params: estado ? { estado } : undefined,
  });
  return response.data;
};


//export const getShipmentHistory = async (repartidorId: number) => {
  //const response = await instance.get(`/shipment/driver/${repartidorId}/history/list`);
export const getShipmentHistory = async (repartidorId: number, estado?: string) => {
  const response = await instance.get(`/shipment/driver/${repartidorId}/history/list`, {
    params: estado ? { estado } : undefined,
  });
  return response.data;
};

export const getShipmentDetail = async (id_envio: number) => {
  const response = await instance.get(`/shipment/${id_envio}/detail/full`);
  return response.data;
};

export const markShipmentDelivered = async (id_envio: number, calificacion_cliente?: number) => {
  const response = await instance.patch(`/shipment/${id_envio}/delivered`, {
    calificacion_cliente,
  });
  return response.data;
};

export const startShipmentRoute = async (id_envio: number) => {
  const response = await instance.patch(`/shipment/${id_envio}/start`, {});
  return response.data;
};


export const assignShipment = async (id_envio: number, repartidorId: number) => {
  const response = await instance.patch(`/shipment/${id_envio}/assign`, {
    id_repartidor: repartidorId,
  });
  return response.data;
};

export const failShipment = async (
  id_envio: number,
  motivo: string,
  notas?: string,
) => {
  const response = await instance.patch(`/shipment/${id_envio}/fail`, {
    motivo,
    notas,
  });
  return response.data;
};

export const getUserProfile = async (id_usuario: number) => {
  const response = await instance.get(`/user/${id_usuario}`);
  return response.data;
};

export const updateUserProfile = async (id_usuario: number, data: Record<string, any>) => {
  const response = await instance.put(`/user/${id_usuario}`, data);
  return response.data;
};

export const getAvailableShipments = async () => {
  const response = await instance.get('/shipment/available/list');
  return response.data;
};