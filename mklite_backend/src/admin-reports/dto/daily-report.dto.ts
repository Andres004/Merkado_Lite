// src/admin-reports/dto/daily-report.dto.ts

export interface DailySummary {
  totalVentas: number;
  totalPedidos: number;
  totalEnvios: number;
  subtotalTotal: number;
  ticketPromedio: number;
  estadosConsiderados: string[];
}

export interface DailyOrderRow {
  id_pedido: number;
  fecha_creacion: Date;
  cliente?: string | null;
  estado: string;
  tipo_entrega: string;
  metodo_pago: string;
  total: number;
}

export interface TopProductRow {
  id_producto: number;
  nombre: string;
  unidades: number;
  revenue: number;
}

export interface InventorySnapshotRow {
  id_producto: number;
  producto: string;
  stock: number;
  stock_minimo: number;
  estado: 'OK' | 'BAJO';
}

export interface DailyReportResponse {
  date: string;
  summary: DailySummary;
  orders: DailyOrderRow[];
  topProducts: TopProductRow[];
  inventorySnapshot: InventorySnapshotRow[];
  lowStock: InventorySnapshotRow[];
}
