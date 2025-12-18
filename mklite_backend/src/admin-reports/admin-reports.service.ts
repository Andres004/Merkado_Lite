import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { Order } from 'src/entity/order.entity';
import { OrderItem } from 'src/entity/orderitem.entity';
import { Inventory } from 'src/entity/inventory.entity';
import { Repository } from 'typeorm';

import {
  DailyReportResponse,
  DailySummary,
  DailyOrderRow,
  TopProductRow,
  InventorySnapshotRow,
} from './dto/daily-report.dto';

@Injectable()
export class AdminReportsService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private inventoryRepository: Repository<Inventory>;

  constructor() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }

    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
  }

  private normalizeDateParam(date?: string): string {
    if (!date) {
      const today = new Date();
      return today.toISOString().slice(0, 10);
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      const today = new Date();
      return today.toISOString().slice(0, 10);
    }

    return parsed.toISOString().slice(0, 10);
  }

  private resolveSaleStates(estado?: string): string[] {
    const fallback = ['entregado'];
    if (!estado) return fallback;

    const normalized = estado.toLowerCase().trim();
    if (normalized === 'all' || normalized === 'todos' || normalized === 'ambos') {
      return ['entregado', 'procesando'];
    }

    const states = normalized
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const allowed = states.filter((s) => ['entregado', 'procesando'].includes(s));
    return allowed.length ? allowed : fallback;
  }

  private getDefaultMinStock(): number {
    const fallback = Number(process.env.DEFAULT_MIN_STOCK ?? 10);
    return isNaN(fallback) ? 10 : fallback;
  }

  async buildDailyReport(dateParam?: string, estado?: string): Promise<DailyReportResponse> {
    const date = this.normalizeDateParam(dateParam);
    const saleStates = this.resolveSaleStates(estado);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .where('DATE(order.fecha_creacion) = :date', { date })
      .andWhere('order.estado IN (:...saleStates)', { saleStates })
      .orderBy('order.fecha_creacion', 'ASC')
      .getMany();

    const summary = this.computeSummary(orders, saleStates);
    const orderRows = this.mapOrders(orders);
    const topProducts = await this.getTopProducts(date, saleStates);
    const inventorySnapshot = await this.getInventorySnapshot();
    const lowStock = inventorySnapshot.filter((row) => row.estado === 'BAJO');

    return {
      date,
      summary,
      orders: orderRows,
      topProducts,
      inventorySnapshot,
      lowStock,
    };
  }

  private computeSummary(orders: Order[], saleStates: string[]): DailySummary {
    const totalVentas = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const subtotalTotal = orders.reduce((sum, order) => sum + Number(order.subtotal ?? 0), 0);
    const totalEnvios = orders.reduce((sum, order) => sum + Number(order.costo_envio ?? 0), 0);

    const totalPedidos = orders.length;
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    return {
      totalVentas: Number(totalVentas.toFixed(2)),
      subtotalTotal: Number(subtotalTotal.toFixed(2)),
      totalEnvios: Number(totalEnvios.toFixed(2)),
      totalPedidos,
      ticketPromedio: Number(ticketPromedio.toFixed(2)),
      estadosConsiderados: saleStates,
    };
  }

  private mapOrders(orders: Order[]): DailyOrderRow[] {
    return orders.map((order) => ({
      id_pedido: order.id_pedido,
      fecha_creacion: order.fecha_creacion,
      cliente: order.client ? `${order.client.nombre} ${order.client.apellido}`.trim() : null,
      estado: order.estado,
      tipo_entrega: order.tipo_entrega,
      metodo_pago: order.metodo_pago,
      total: Number(order.total ?? 0),
    }));
  }

  private async getTopProducts(date: string, saleStates: string[]): Promise<TopProductRow[]> {
    const rows = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .select('item.id_producto', 'id_producto')
      .addSelect('product.nombre', 'nombre')
      .addSelect('SUM(item.cantidad)', 'unidades')
      .addSelect('SUM(item.cantidad * item.precio_unitario)', 'revenue')
      .where('DATE(order.fecha_creacion) = :date', { date })
      .andWhere('order.estado IN (:...saleStates)', { saleStates })
      .groupBy('item.id_producto')
      .addGroupBy('product.nombre')
      .orderBy('unidades', 'DESC')
      .limit(10)
      .getRawMany();

    return rows.map((row) => ({
      id_producto: Number(row.id_producto),
      nombre: row.nombre,
      unidades: Number(row.unidades),
      revenue: Number(Number(row.revenue).toFixed(2)),
    }));
  }

  private async getInventorySnapshot(): Promise<InventorySnapshotRow[]> {
    const defaultMinStock = this.getDefaultMinStock();

    const inventories = await this.inventoryRepository.find({
      relations: ['product'],
      order: { id_producto: 'ASC' },
    });

    return inventories.map((inventory) => {
      const stock = Number(inventory.stock_disponible ?? 0);
      const minStockRaw = Number(inventory.stock_minimo ?? 0);
      const minStock = minStockRaw > 0 ? minStockRaw : defaultMinStock;

      const estado: 'OK' | 'BAJO' = stock <= minStock ? 'BAJO' : 'OK';

      return {
        id_producto: inventory.id_producto,
        producto: inventory.product?.nombre ?? `Producto ${inventory.id_producto}`,
        stock,
        stock_minimo: minStock,
        estado,
      };
    });
  }
}
