'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderDetail } from '../../../services/order.service';

interface ProductInfo {
  nombre?: string;
  precio_venta?: number;
}

interface OrderItem {
  id_pedido?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario?: number;
  product?: ProductInfo;
}

interface ShipmentInfo {
  estado_envio?: string;
  costo_envio?: number;
}

interface OrderDetail {
  id_pedido: number;
  fecha_creacion?: string;
  estado?: string;
  tipo_pedido?: string;
  metodo_pago?: string;
  direccion_entrega?: string;
  tipo_entrega?: string;
  costo_envio?: number | string | null;
  total?: number | string | null;
  items?: OrderItem[];
  shipment?: ShipmentInfo | null;
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderDetail(Number(params.id));
      setOrder(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.replace('/login');
        return;
      }
      if (err?.response?.status === 404) {
        setError('No encontramos este pedido.');
      } else {
        setError('No pudimos cargar el detalle del pedido.');
      }
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
    fetchOrder();
  }, [router, params.id]);

  const estado = useMemo(() => formatEstado(order?.estado), [order?.estado]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">Mi Cuenta / Historial de Pedidos / Detalle</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{params.id}</h1>
            <p className="text-gray-600">Fecha: {formatDate(order?.fecha_creacion)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold self-start ${estado.className}`}>
            {estado.label}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Cargando detalle...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 font-medium">{error}</div>
      ) : !order ? (
        <div className="p-6 text-center text-gray-500">Pedido no disponible.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Información del pedido</h3>
              <p className="text-sm text-gray-700">Tipo de pedido: <span className="font-semibold">{order.tipo_pedido || '-'}</span></p>
              <p className="text-sm text-gray-700">Método de pago: <span className="font-semibold">{order.metodo_pago || '-'}</span></p>
              <p className="text-sm text-gray-700">Tipo de entrega: <span className="font-semibold capitalize">{order.tipo_entrega || '-'}</span></p>
              <p className="text-sm text-gray-700">Dirección de entrega: <span className="font-semibold">{order.direccion_entrega || 'No registrada'}</span></p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Totales</h3>
              <p className="text-sm text-gray-700">Costo de envío: <span className="font-semibold">{formatCurrency(order.costo_envio)}</span></p>
              <p className="text-sm text-gray-700">Total del pedido: <span className="font-semibold">{formatCurrency(order.total)}</span></p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Productos del pedido</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio unitario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.length ? (
                    order.items.map((item) => {
                      const subtotal = Number(item.cantidad) * Number(item.precio_unitario ?? 0);
                      return (
                        <tr key={`${item.id_pedido}-${item.id_producto}`}>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.product?.nombre || `Producto ${item.id_producto}`}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.cantidad}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(item.precio_unitario)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatCurrency(subtotal)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay productos registrados para este pedido.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/perfil/pedidos"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
            >
              Volver
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}