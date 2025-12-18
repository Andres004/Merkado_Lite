'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders } from '../../services/order.service';
import { Package, Calendar, CreditCard, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';

// --- INTERFACES Y CONFIGURACIÓN ---
interface OrderSummary {
  id_pedido: number;
  fecha_creacion?: string;
  total?: number | string | null;
  estado?: string;
}

// Configuración de colores para los estados
const estadoConfig: Record<string, { label: string; className: string; iconClass: string }> = {
    pendiente: { label: 'Pendiente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', iconClass: 'bg-yellow-400' },
    procesando: { label: 'Procesando', className: 'bg-blue-50 text-blue-700 border-blue-200', iconClass: 'bg-blue-400' },
    en_camino: { label: 'En Camino', className: 'bg-orange-50 text-orange-700 border-orange-200', iconClass: 'bg-orange-400' },
    entregado: { label: 'Entregado', className: 'bg-green-50 text-green-700 border-green-200', iconClass: 'bg-green-400' },
    cancelado: { label: 'Cancelado', className: 'bg-red-50 text-red-700 border-red-200', iconClass: 'bg-[#F40009]' },
    // Configuración para 'asignado' -> En Camino (Amarillo/Naranja)
    asignado: { label: 'En Camino', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', iconClass: 'bg-yellow-400' },
};

const formatEstado = (estado?: string) => {
  if (!estado) return { label: 'Desconocido', className: 'bg-gray-50 text-gray-600 border-gray-200', iconClass: 'bg-gray-400' };
  const key = estado.toLowerCase().replace(/\s+/g, '_');
  return estadoConfig[key] ?? { label: estado, className: 'bg-gray-50 text-gray-600 border-gray-200', iconClass: 'bg-gray-400' };
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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

// --- COMPONENTE PRINCIPAL ---
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
      const response = await getMyOrders({ page: newPage, limit: 8 });
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

  // --- RENDER ---
  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full text-[#F40009]">
              <Package size={28} />
          </div>
          <div>
            {/* FORZADO DE COLOR: 
                Se usa style={{ color: '#F40009' }} para asegurar que sea rojo 
                incluso si hay conflictos de CSS.
            */}
            <h1 
                className="text-3xl font-extrabold" 
                style={{ color: '#F40009' }}
            >
                Historial de Pedidos
            </h1>
            <p className="text-sm text-gray-500">Revisa el estado y detalle de tus compras recientes.</p>
          </div>
      </div>

      {/* Tarjeta contenedora de la tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Estado de Carga */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="h-8 w-8 bg-[#F40009] rounded-full animate-bounce mb-4"></div>
                <p className="text-gray-400 text-sm font-medium">Cargando tus pedidos...</p>
            </div>
        )}

        {/* Estado de Error */}
        {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-red-600">
                <AlertCircle size={32} className="mb-2" />
                <p className="font-medium">{error}</p>
            </div>
        )}
        
        {/* Estado Vacío */}
        {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                    <ShoppingBag size={48} />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">Aún no has realizado ningún pedido.</p>
                <Link href="/" className="text-[#F40009] font-bold hover:underline flex items-center gap-1">
                    Ir a comprar <ChevronRight size={16} />
                </Link>
            </div>
        )}

        {/* Tabla de Datos */}
        {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
                {orders.map((order) => {
                  const estado = formatEstado(order.estado);
                  return (
                    <tr key={order.id_pedido} className="hover:bg-red-50/30 transition-colors group">
                      
                      {/* ID Pedido */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-[#F40009] group-hover:bg-white transition-colors border border-gray-200">
                                <Package size={20} />
                            </div>
                            <div className="ml-4">
                                <div className="text-lg font-extrabold text-gray-900 group-hover:text-[#F40009] transition-colors">
                                    #{order.id_pedido}
                                </div>
                                <div className="md:hidden text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Calendar size={12} /> {formatDate(order.fecha_creacion)}
                                </div>
                            </div>
                        </div>
                      </td>
                      
                      {/* Fecha */}
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
                             <Calendar size={16} className="text-gray-400" />
                             {formatDate(order.fecha_creacion)}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-gray-400 hidden sm:block" />
                            <span className="text-lg font-extrabold text-[#F40009]">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${estado.className}`}>
                          <span className={`w-2 h-2 rounded-full ${estado.iconClass}`}></span>
                          {estado.label}
                        </span>
                      </td>

                      {/* Botón */}
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/perfil/pedidos/${order.id_pedido}`}
                          className="inline-flex items-center gap-1 text-[#F40009] hover:text-red-800 font-bold hover:underline group/link transition-all"
                        >
                          Ver Detalle
                          <ChevronRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        )}
        
        {/* Paginación */}
        {!loading && !error && orders.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2">
                {paginationButtons.map((num) => (
                <button
                    key={num}
                    disabled={num === page || loading}
                    onClick={() => fetchOrders(num)}
                    className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all ${
                    num === page
                        ? 'bg-[#F40009] text-white shadow-md shadow-red-200 transform scale-105'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#F40009] hover:text-[#F40009]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {num}
                </button>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}