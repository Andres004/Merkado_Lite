'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderDetail } from '../../../services/order.service';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Package, 
  Calendar, 
  ShoppingBag,
  DollarSign
} from 'lucide-react';

// --- INTERFACES ---
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

// --- CONFIGURACIÓN DE ESTADOS (Misma paleta que el historial) ---
const estadoConfig: Record<string, { label: string; className: string; iconClass: string }> = {
  procesando: { label: 'Procesando', className: 'bg-blue-50 text-blue-700 border-blue-200', iconClass: 'bg-blue-400' },
  en_camino: { label: 'En Camino', className: 'bg-orange-50 text-orange-700 border-orange-200', iconClass: 'bg-orange-400' },
  // 'Asignado' ahora se ve amarillo/naranja y dice "En Camino"
  asignado: { label: 'En Camino', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', iconClass: 'bg-yellow-400' },
  entregado: { label: 'Entregado', className: 'bg-green-50 text-green-700 border-green-200', iconClass: 'bg-green-400' },
  cancelado: { label: 'Cancelado', className: 'bg-red-50 text-red-700 border-red-200', iconClass: 'bg-[#F40009]' },
  anulado: { label: 'Anulado', className: 'bg-red-50 text-red-700 border-red-200', iconClass: 'bg-[#F40009]' },
  rechazado: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200', iconClass: 'bg-[#F40009]' },
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
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 'Bs. 0.00';
  return `Bs. ${numeric.toFixed(2)}`;
};

// --- COMPONENTE PRINCIPAL ---
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

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="h-10 w-10 bg-[#F40009] rounded-full animate-bounce mb-4"></div>
            <p className="text-gray-400 font-medium">Cargando detalle del pedido...</p>
        </div>
    );
  }

  if (error || !order) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-4 bg-red-50 rounded-full text-red-500 mb-4">
                <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ups, algo salió mal</h2>
            <p className="text-gray-500 mb-6">{error || 'El pedido no está disponible.'}</p>
            <Link href="/perfil/pedidos" className="text-[#F40009] font-bold hover:underline">
                Volver al historial
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb / Back Link */}
        <Link 
            href="/perfil/pedidos" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-[#F40009] transition-colors self-start group"
        >
            <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al Historial
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-50 text-[#F40009] rounded-xl hidden sm:block">
                <Package size={32} />
             </div>
             <div>
                {/* TÍTULO EN ROJO (#F40009) */}
                <h1 className="text-3xl font-extrabold text-[#F40009]" style={{ color: '#F40009' }}>
                    Pedido #{params.id}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar size={14} />
                    <span>Realizado el {formatDate(order.fecha_creacion)}</span>
                </div>
             </div>
          </div>

          {/* Badge de Estado */}
          <div className="self-start md:self-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border shadow-sm ${estado.className}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${estado.iconClass} animate-pulse`}></span>
                {estado.label}
            </span>
          </div>
        </div>
      </div>

      {/* --- INFO CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Información General */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Detalles de Envío y Pago */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="text-gray-400" size={20} /> Información de Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</p>
                        <div className="flex items-start gap-2 text-gray-700">
                            <MapPin size={18} className="text-[#F40009] mt-0.5 shrink-0" />
                            <span className="font-medium">{order.direccion_entrega || 'No registrada'}</span>
                        </div>
                    </div>
                    <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Método de Entrega</p>
                         <p className="font-medium text-gray-700 capitalize">{order.tipo_entrega || '-'}</p>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Método de Pago</p>
                        <div className="flex items-center gap-2 text-gray-700">
                            <CreditCard size={18} className="text-gray-400" />
                            <span className="font-medium capitalize">{order.metodo_pago || '-'}</span>
                        </div>
                    </div>
                    <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo de Pedido</p>
                         <p className="font-medium text-gray-700 capitalize badge badge-ghost">{order.tipo_pedido || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">Productos ({order.items?.length || 0})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-white">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-center text-xs font-extrabold text-gray-400 uppercase tracking-wider">Cant.</th>
                        <th className="px-6 py-3 text-right text-xs font-extrabold text-gray-400 uppercase tracking-wider">Precio U.</th>
                        <th className="px-6 py-3 text-right text-xs font-extrabold text-gray-400 uppercase tracking-wider">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {order.items?.length ? (
                        order.items.map((item) => {
                            const subtotal = Number(item.cantidad) * Number(item.precio_unitario ?? 0);
                            return (
                            <tr key={`${item.id_pedido}-${item.id_producto}`} className="hover:bg-red-50/10 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {item.product?.nombre || `Producto ${item.id_producto}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-center font-semibold bg-gray-50/30">
                                    x{item.cantidad}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                    {formatCurrency(item.precio_unitario)}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    {formatCurrency(subtotal)}
                                </td>
                            </tr>
                            );
                        })
                        ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                No hay productos registrados.
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Columna Derecha: Resumen de Costos */}
        <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <DollarSign className="text-gray-400" size={20} /> Resumen
                </h3>
                
                <div className="space-y-3 pb-6 border-b border-dashed border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        {/* Calculamos un subtotal aproximado visualmente restando envío */}
                        <span className="font-medium">
                            {formatCurrency(Number(order.total || 0) - Number(order.costo_envio || 0))}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Costo de envío</span>
                        <span className="font-medium">{formatCurrency(order.costo_envio)}</span>
                    </div>
                </div>

                <div className="pt-6 flex justify-between items-end">
                    <span className="text-gray-900 font-bold text-lg">Total</span>
                    <span className="text-2xl font-extrabold text-[#F40009]">
                        {formatCurrency(order.total)}
                    </span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}