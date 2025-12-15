'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders } from '../../services/order.service';

interface OrderSummary {
  id_pedido: number;
  fecha_creacion?: string;
  total?: number | string | null;
  estado?: string;
}

const estadoConfig: Record<string, { label: string; className: string }> = {
  procesando: { label: 'Procesando', className: 'bg-slate-100 text-slate-700' },
  en_camino: { label: 'En Camino', className: 'bg-amber-100 text-amber-700' },
  asignado: { label: 'En Camino', className: 'bg-amber-100 text-amber-700' },
  entregado: { label: 'Entregado', className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  anulado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  rechazado: { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
};

const formatEstado = (estado?: string) => {
  if (!estado) return { label: 'Desconocido', className: 'bg-gray-100 text-gray-700' };
  const key = estado.toLowerCase().replace(/\s+/g, '_');
  return estadoConfig[key] ?? { label: estado, className: 'bg-gray-100 text-gray-700' };
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 'Bs. 0.00';
  return `Bs. ${numeric.toFixed(2)}`;
};

const normalizeResponse = (payload: any): { data: OrderSummary[]; totalPages: number; page: number } => {
  if (!payload) return { data: [], totalPages: 1, page: 1 };
  if (Array.isArray(payload)) return { data: payload, totalPages: 1, page: 1 };

  return {
    data: payload.data ?? [],
    totalPages: payload.totalPages ?? (payload.total && payload.limit ? Math.ceil(payload.total / payload.limit) : 1),
    page: payload.page ?? 1,
  };
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (newPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyOrders({ page: newPage, limit: 10 });
      const normalized = normalizeResponse(response);
      setOrders(normalized.data);
      setTotalPages(Math.max(1, normalized.totalPages));
      setPage(normalized.page);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.replace('/login');
        return;
      }
      setError('No pudimos cargar tus pedidos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchOrders(1);
  }, [router]);

  const paginationButtons = useMemo(() => {
    const buttons: number[] = [];
    for (let i = 1; i <= totalPages; i += 1) {
      buttons.push(i);
    }
    return buttons;
  }, [totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Mi Cuenta / Historial de Pedidos</p>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h1>
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° de Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">Cargando pedidos...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-red-600 font-medium">{error}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">No tienes pedidos registrados.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const estado = formatEstado(order.estado);
                  return (
                    <tr key={order.id_pedido} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">#{order.id_pedido}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.fecha_creacion)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.className}`}>
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/perfil/pedidos/${order.id_pedido}`}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Ver Detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {paginationButtons.map((num) => (
          <button
            key={num}
            disabled={num === page || loading}
            onClick={() => fetchOrders(num)}
            className={`px-3 py-1 rounded-md text-sm border ${
              num === page
                ? 'bg-red-600 text-white border-red-600'
                : 'border-gray-200 text-gray-700 hover:bg-gray-100'
            } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}