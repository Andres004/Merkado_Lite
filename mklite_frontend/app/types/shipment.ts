export interface ShipmentClient {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}

export interface ShipmentProduct {
  nombre?: string;
  precio?: number;
}

export interface ShipmentOrderItem {
  id_item?: number;
  cantidad?: number;
  precio_unitario?: number | string;
  product?: ShipmentProduct;
}

export interface ShipmentOrder {
  id_pedido: number;
  direccion_entrega?: string;
  total?: number | string;
  metodo_pago?: string;
  tipo_entrega?: string;
  estado?: string;
  client?: ShipmentClient;
  items?: ShipmentOrderItem[];
  nota_cliente?: string;
  notas?: string;
}


export interface Shipment {
  id_envio: number; 
  estado_envio: string;
  sector?: string;
  fecha_salida?: string;
  fecha_entrega?: string;
  calificacion_cliente?: number | null;
  failure_reason?: string;
  failure_notes?: string;
  failure_reported_at?: string;
  order?: ShipmentOrder;
}