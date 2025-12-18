// app/models/inventory.model.ts

export interface ProductShort {
  id_producto: number;
  nombre: string;
}

export interface InventoryModel {
  id_producto: number;
  stock_disponible: number;
  stock_reservado: number;
  stock_minimo: number;
  stock_vencido: number;
  stock_danado: number;
  ultima_actualizacion: string;
  product: ProductShort; // Relación con producto
}

export interface CreateBatchDto {
  id_producto: number;
  id_proveedor: number;
  fecha_recepcion: string;
  fecha_vencimiento: string;
  costo_unitario: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  estado_lote: string;
}

export interface SupplierModel {
  id_proveedor: number;
  nombre: string;
}

export interface BatchModel {
  id_lote: number | string;
  fecha_recepcion?: string;
  fecha_vencimiento: string;
  costo_unitario: number;
  cantidad_inicial: number;
  cantidad_disponible: number;
  estado_lote: string;
}