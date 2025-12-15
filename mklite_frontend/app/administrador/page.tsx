"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar'; // Importamos el sidebar creado
import { MoreVertical, DollarSign, RotateCw, ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { getOrders, cancelOrder } from '../services/order.service';
import { getRefundsByDateRange } from '../services/refund.service';
import { getAllInventoryService } from '../services/inventory.service';

interface ProductInfo {
  nombre?: string;
}

interface OrderItem {
  id_producto: number;
  cantidad: number;
  precio_unitario?: number;
  product?: ProductInfo;
}

interface OrderData {
  id_pedido: number;
  estado?: string;
  total?: number;
  fecha_creacion?: string;
  items?: OrderItem[];
}

interface RefundData {
  id_devolucion: number;
  monto_total: number;
  fecha: string;
}

interface InventoryItem {
  id_producto: number;
  stock_disponible: number;
  stock_minimo: number;
  product?: {
    nombre?: string;
  };
}

interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}

interface HourlySale {
  hour: string;
  sales: number;
}

interface TopProductData {
  name: string;
  sales: number;
}

const formatCurrency = (value: number) =>
  `Bs. ${Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const normalizeEstado = (estado?: string) => (estado || '').toLowerCase();

const getDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const getDateRangeStrings = (dateValue: string) => {
  const baseDate = new Date(dateValue);
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

/**
 * Gráfico de Línea SVG para Ventas Por Hora.
 */
const SalesLineChart: React.FC<{ data: HourlySale[] }> = ({ data }) => {
  const width = 600;
  const height = 200;
  const padding = 30;

  const maxDataSales = data.length ? Math.max(...data.map((d) => d.sales)) : 0;
  const maxSales = Math.max(50, Math.ceil((maxDataSales || 1) / 50) * 50);
  const xUnit = data.length > 1 ? (width - 2 * padding) / (data.length - 1) : 0;
  const yUnit = (height - 2 * padding) / (maxSales || 1);

  const points =
    data.length > 0
      ? data
          .map((d, i) => {
            const x = padding + i * xUnit;
            const y = height - padding - d.sales * yUnit;
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  const yLines = [0, maxSales / 4, maxSales / 2, (3 * maxSales) / 4, maxSales].map((value, index) => {
    const y = height - padding - value * yUnit;
    return (
      <g key={`y-axis-${index}`}>
        <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="3 3" />
        <text x={padding - 5} y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
          {value.toFixed(0)} Bs.
        </text>
      </g>
    );
  });

  const xLabels = data.map((d, i) => {
    const x = padding + i * xUnit;
    return (
      <text key={d.hour} x={x} y={height - padding + 15} textAnchor="middle" className="text-xs fill-gray-700">
        {d.hour}
      </text>
    );
  });

  return (
    <div className="relative h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {yLines}

        {data.length > 0 && (
          <>
            <polyline
              fill="none"
              stroke="#F40009"
              strokeWidth="4"
              points={points}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {data.map((d, i) => {
              const x = padding + i * xUnit;
              const y = height - padding - d.sales * yUnit;
              return <circle key={`dot-${i}`} cx={x} cy={y} r="4" fill="#F40009" stroke="white" strokeWidth="2" />;
            })}
          </>
        )}

        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
        {xLabels}
      </svg>
      {data.every((point) => point.sales === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Sin ventas registradas en este horario
        </div>
      )}
    </div>
  );
};

/**
 * Gráfico de Barras SVG para Productos Más Vendidos.
 */
const TopProductsBarChart: React.FC<{ data: TopProductData[] }> = ({ data }) => {
  const width = 300;
  const height = 200;
  const padding = 20;
  const barWidth = 20;

  const maxSales = data.length ? Math.max(...data.map((d) => d.sales)) : 0;
  const safeMax = maxSales || 1;
  const totalBars = data.length || 1;
  const groupSpace = (width - 2 * padding) / totalBars;

  const bars = data.map((d, i) => {
    const x = padding + i * groupSpace + groupSpace / 2 - barWidth / 2;
    const barHeight = (d.sales / safeMax) * (height - 2 * padding);
    const y = height - padding - barHeight;

    return (
      <g key={d.name}>
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill="#F40009"
          rx="4"
          ry="4"
          className="hover:fill-red-700 transition-colors duration-150"
        />
        <text
          x={x + barWidth / 2}
          y={height - padding + 5}
          textAnchor="middle"
          className="text-xs fill-gray-700"
          transform={`rotate(45, ${x + barWidth / 2}, ${height - padding + 5}) translate(0, 10)`}
        >
          {d.name.split(' ').map((word, idx) => (
            <tspan key={idx} x={x + barWidth / 2} dy={idx === 0 ? 0 : '1.2em'}>
              {word}
            </tspan>
          ))}
        </text>
      </g>
    );
  });

  return (
    <div className="relative h-full">
      <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full h-full overflow-visible">
        <g transform={`translate(0, 0)`}>{bars}</g>
      </svg>
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Sin productos vendidos
        </div>
      )}
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-full ${color.split(' ')[1]}`}>
        <Icon size={20} className={color.split(' ')[0]} />
      </div>
    </div>
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
      <span className="text-xs font-medium text-gray-500">{subtext}</span>
      <MoreVertical size={16} className="text-gray-400 cursor-pointer hover:text-gray-700 transition" />
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getDateInputValue(new Date()));
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [refunds, setRefunds] = useState<RefundData[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchDashboardData = async (dateValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getDateRangeStrings(dateValue);
      const [ordersData, refundsData, inventoryData] = await Promise.all([
        getOrders({ fecha: dateValue }),
        getRefundsByDateRange(start, end),
        getAllInventoryService(),
      ]);

      setOrders(ordersData || []);
      setRefunds(refundsData || []);
      setInventory(inventoryData || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del panel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  const isOrderCountable = (estado?: string) => {
    const normalized = normalizeEstado(estado);
    return !['anulado', 'cancelado', 'devuelto', 'fallido'].includes(normalized);
  };

  const validOrders = useMemo(() => orders.filter((order) => isOrderCountable(order.estado)), [orders]);

  const hourlySales = useMemo(() => {
    const hoursRange = Array.from({ length: 11 }, (_, i) => 8 + i);
    return hoursRange.map((hour) => {
      const total = validOrders.reduce((sum, order) => {
        const orderDate = order.fecha_creacion ? new Date(order.fecha_creacion) : null;
        if (orderDate && !isNaN(orderDate.getTime()) && orderDate.getHours() === hour) {
          return sum + Number(order.total || 0);
        }
        return sum;
      }, 0);
      return { hour: `${hour}:00`, sales: total };
    });
  }, [validOrders]);

  const topProducts = useMemo(() => {
    const productMap = new Map<number, TopProductData>();

    validOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const current = productMap.get(item.id_producto) || {
          name: item.product?.nombre || `Producto ${item.id_producto}`,
          sales: 0,
        };
        current.sales += Number(item.cantidad || 0);
        productMap.set(item.id_producto, current);
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);
  }, [validOrders]);

  const totalSales = useMemo(
    () => validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [validOrders],
  );

  const refundAmount = useMemo(
    () => refunds.reduce((sum, refund) => sum + Number(refund.monto_total || 0), 0),
    [refunds],
  );

  const stockAlerts = useMemo(
    () => inventory.filter((item) => item.stock_disponible <= item.stock_minimo),
    [inventory],
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => ['pendiente', 'procesando', 'asignado'].includes(normalizeEstado(order.estado))),
    [orders],
  );

  const kpis: KpiCardProps[] = [
    {
      title: 'Ventas de Hoy',
      value: formatCurrency(totalSales),
      subtext: `${validOrders.length} pedidos contabilizados`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Pedidos de Hoy',
      value: validOrders.length.toString(),
      subtext: `${pendingOrders.length} pendientes de asignar`,
      icon: ShoppingCart,
      color: 'text-[#F40009] bg-red-50',
    },
    {
      title: 'Devoluciones',
      value: refunds.length.toString(),
      subtext: refundAmount > 0 ? `(${formatCurrency(refundAmount)})` : 'Sin monto devuelto',
      icon: RotateCw,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  const handleCancelOrder = async (id_pedido: number) => {
    try {
      setCancellingId(id_pedido);
      await cancelOrder(id_pedido);
      await fetchDashboardData(selectedDate);
    } catch (err) {
      console.error(err);
      setError('No se pudo anular el pedido.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-64">
            <AdminSidebar />
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-extrabold text-red-600">  Panel de Control: Resumen del Día</h1>
              

              <div className="flex items-center gap-3">
                {loading && <Loader2 className="animate-spin text-gray-500" />}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* 1. Tarjetas de Indicadores Clave (KPIs) */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                  <KpiCard key={kpi.title} {...kpi} />
                ))}
              </div>
            </section>

            {/* 2. Gráficos de Análisis */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Ventas Por Hora</h2>
                <div className="h-96">
                  <SalesLineChart data={hourlySales} />
                </div>
              </div>

              <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Productos Más Vendidos</h2>
                <div className="h-96 flex items-end justify-center pt-10">
                  <TopProductsBarChart data={topProducts} />
                </div>
              </div>
            </section>

            {/* 3. Alertas y Pedidos Pendientes */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Alertas de Stock Mínimo</h2>
                <div className="space-y-4">
                  {stockAlerts.length === 0 && <p className="text-sm text-gray-500">No hay alertas por ahora.</p>}
                  {stockAlerts.map((alert) => (
                    <div key={alert.id_producto} className="border-l-4 border-yellow-500 pl-3">
                      <p className="font-semibold text-gray-900">{alert.product?.nombre || `Producto ${alert.id_producto}`}</p>
                      <p className="text-sm text-gray-600">
                        Quedan {alert.stock_disponible}/{alert.stock_minimo} -{' '}
                        <span className="text-xs text-yellow-600">Reabastecer</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <Link href="/administrador/inventario" className="text-sm text-[#F40009] hover:underline font-medium">
                    Ver Inventario Completo
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Últimos Pedidos (Pendientes)</h2>
                <ul className="space-y-4">
                  {pendingOrders.length === 0 && <li className="text-sm text-gray-500">No hay pedidos pendientes.</li>}
                  {pendingOrders.slice(0, 5).map((order) => (
                    <li key={order.id_pedido} className="flex justify-between items-center text-sm border-b pb-2">
                      <span>
                        (#
                        {order.id_pedido}) {formatCurrency(Number(order.total || 0))}
                      </span>
                      <div className="space-x-2 text-right">
                        <Link
                          href={`/administrador/pedidos?pedido=${order.id_pedido}`}
                          className="text-blue-500 hover:underline font-medium"
                        >
                          Asignar Repartidor
                        </Link>
                        <Link href={`/administrador/pedidos?pedido=${order.id_pedido}`} className="text-gray-500 hover:underline">
                          Ver Detalle
                        </Link>
                        <button
                          onClick={() => handleCancelOrder(order.id_pedido)}
                          className="text-red-500 hover:underline disabled:text-gray-400"
                          disabled={cancellingId === order.id_pedido}
                          title="Anular Pedido"
                        >
                          {cancellingId === order.id_pedido ? 'Anulando...' : 'Anular Pedido'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-right">
                  <Link href="/administrador/pedidos" className="text-sm text-[#F40009] hover:underline font-medium">
                    Ver todos los Pedidos
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}