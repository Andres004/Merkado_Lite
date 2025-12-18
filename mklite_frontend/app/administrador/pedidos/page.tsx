"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Search,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { getOrders, getOrderDetail, cancelOrder } from "../../services/order.service";
import {
  assignShipment,
  getShipmentByOrder,
  markShipmentDelivered,
} from "../../services/shipment.service";
import { getUsers, getUserById } from "../../services/user.service";

interface ProductInfo {
  nombre_producto?: string;
  precio_venta?: number;
}

interface OrderItem {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  product?: ProductInfo;
}

interface ClientInfo {
  nombre?: string;
  apellido?: string;
}

interface ShipmentInfo {
  id_envio: number;
  estado_envio: string;
  id_repartidor?: number;
  sector?: string;
  fecha_salida?: string;
  fecha_entrega?: string;
}

interface OrderData {
  id_pedido: number;
  client?: ClientInfo;
  total: number;
  estado: string;
  tipo_entrega: string;
  fecha_creacion?: string;
  metodo_pago?: string;
  tipo_pedido?: string;
  direccion_entrega?: string;
  items?: OrderItem[];
  shipment?: ShipmentInfo | null;
}

interface UserRole {
  role?: { nombre: string };
}

interface UserData {
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  userRoles?: UserRole[];
}

const estadoStyles: Record<
  string,
  { bg: string; text: string; icon: typeof Clock; label: string }
> = {
  pendiente: {
    bg: "bg-yellow-100",
    text: "text-yellow-800", // Más oscuro
    icon: Clock,
    label: "Pendiente",
  },
  procesando: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: Clock,
    label: "Pendiente",
  },
  asignado: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: Truck,
    label: "Asignado",
  },
  en_camino: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: Truck,
    label: "En Camino",
  },
  entregado: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: CheckCircle,
    label: "Entregado",
  },
  cancelado: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: XCircle,
    label: "Cancelado",
  },
  anulado: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: XCircle,
    label: "Cancelado",
  },
  fallido: {
    bg: "bg-gray-200",
    text: "text-gray-900",
    icon: AlertTriangle,
    label: "Fallido",
  },
};

const formatEstadoClave = (estado?: string) => estado?.toLowerCase().replace(/\s+/g, "_") || "";

const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const key = formatEstadoClave(estado);
  const style = estadoStyles[key] || estadoStyles.pendiente;
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${style.bg} ${style.text}`}
    >
      <Icon size={14} className="mr-1" />
      {style.label}
    </span>
  );
};

const formatFecha = (fecha?: string) => {
  if (!fecha) return "-";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value: unknown) => {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? parseFloat(value)
      : 0;

  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
};

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    // CAMBIO: backdrop-blur-sm para efecto iPhone
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="text-[#F40009]" size={28} />
          </div>
          {/* CAMBIO: Texto negro */}
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <p className="text-gray-900 font-medium">{message}</p>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-medium hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalleData, setDetalleData] = useState<OrderData | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [drivers, setDrivers] = useState<UserData[]>([]);
  const [driverNames, setDriverNames] = useState<Record<number, string>>({});
  const [driverSeleccionado, setDriverSeleccionado] = useState<number | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState<OrderData | null>(null);

  const fetchOrders = async (fecha?: string) => {
    const effectiveDate = fecha ?? (filtroFecha || undefined);
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(effectiveDate ? { fecha: effectiveDate } : undefined);
      setOrders(data || []);
    } catch (err) {
      setError("No se pudo cargar los pedidos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getUsers();
      // Usamos as any para evitar el error estricto de TypeScript en el build
      const data: UserData[] = (response?.data || []) as any;
      const onlyDrivers = data.filter((user) =>
        user.userRoles?.some((ur) => ur.role?.nombre?.toUpperCase() === "REPARTIDOR")
      );
      setDrivers(onlyDrivers);
      const map = onlyDrivers.reduce<Record<number, string>>((acc, driver) => {
        const fullName = `${driver.nombre || ""} ${driver.apellido || ""}`.trim();
        if (driver.id_usuario) acc[driver.id_usuario] = fullName;
        return acc;
      }, {});
      setDriverNames((prev) => ({ ...map, ...prev }));
    } catch (err) {
      // No bloquear la vista si falla
    }
  };

  useEffect(() => {
    fetchOrders(filtroFecha || undefined);
  }, [filtroFecha]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const ensureDriverName = async (id_repartidor?: number) => {
    if (!id_repartidor || driverNames[id_repartidor]) return;
    const cachedDriver = drivers.find((driver) => driver.id_usuario === id_repartidor);
    if (cachedDriver) {
      const fullName = `${cachedDriver.nombre || ""} ${cachedDriver.apellido || ""}`.trim();
      setDriverNames((prev) => ({ ...prev, [id_repartidor]: fullName || `ID ${id_repartidor}` }));
      return;
    }

    try {
      const driver = await getUserById(id_repartidor);
      const fullName = `${driver?.nombre || ""} ${driver?.apellido || ""}`.trim();
      setDriverNames((prev) => ({ ...prev, [id_repartidor]: fullName || `ID ${id_repartidor}` }));
    } catch (err) {
      setDriverNames((prev) => ({ ...prev, [id_repartidor]: `ID ${id_repartidor}` }));
    }
  };

  const getDriverName = (id_repartidor?: number) => {
    if (!id_repartidor) return "No asignado";
    return driverNames[id_repartidor] || `ID ${id_repartidor}`;
  };

  const normalizarFechaLocal = (fecha: Date) => {
    return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const coincideFecha = (pedido: OrderData) => {
    if (!filtroFecha) return true;
    if (!pedido.fecha_creacion) return false;
    const fechaPedido = new Date(pedido.fecha_creacion);
    if (Number.isNaN(fechaPedido.getTime())) return false;
    return normalizarFechaLocal(fechaPedido) === filtroFecha;
  };

  const estadosDisponibles = useMemo(() => {
    const estados = new Set<string>();
    orders.forEach((p) => estados.add(formatEstadoClave(p.estado)));
    return ["Todos", ...Array.from(estados)];
  }, [orders]);

  const pedidosFiltrados = useMemo(() => {
    return orders.filter((pedido) => {
      const estadoKey = formatEstadoClave(pedido.estado);
      const estadoMatch = filtroEstado === "Todos" || estadoKey === filtroEstado;
      const busquedaMatch =
        pedido.id_pedido.toString().includes(busqueda) ||
        `${pedido.client?.nombre || ""} ${pedido.client?.apellido || ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      return estadoMatch && busquedaMatch && coincideFecha(pedido);
    });
  }, [orders, filtroEstado, busqueda, filtroFecha]);

  const abrirDetalle = async (pedido: OrderData) => {
    setDetalleAbierto(true);
    setDetalleLoading(true);
    setError(null);
    setSelectedOrder(pedido);
    try {
      const [orderData, shipmentData] = await Promise.all([
        getOrderDetail(pedido.id_pedido),
        pedido.shipment ? Promise.resolve(pedido.shipment) : getShipmentByOrder(pedido.id_pedido).catch(() => null),
      ]);

      const resolvedShipment = shipmentData ?? pedido.shipment ?? null;
      setDetalleData({
        ...pedido,
        ...orderData,
        shipment: resolvedShipment,
      });
      await ensureDriverName(resolvedShipment?.id_repartidor);
    } catch (err) {
      setError("No se pudo cargar el detalle del pedido.");
    } finally {
      setDetalleLoading(false);
    }
  };

  const abrirAsignacion = (pedido: OrderData) => {
    setSelectedOrder(pedido);
    setDriverSeleccionado(null);
    setAssignOpen(true);
    setSuccessMessage(null);
    setError(null);
  };

  const confirmarAsignacion = async () => {
    if (!selectedOrder?.shipment?.id_envio || !driverSeleccionado) return;
    setActionLoading(true);
    setError(null);
    try {
      await assignShipment(selectedOrder.shipment.id_envio, driverSeleccionado);
      setAssignOpen(false);
      setSuccessMessage("Repartidor asignado correctamente.");
      await fetchOrders();
    } catch (err) {
      setError("No se pudo asignar el repartidor.");
    } finally {
      setActionLoading(false);
    }
  };

  const abrirCancelacion = (pedido: OrderData) => {
    setPedidoACancelar(pedido);
    setConfirmCancelOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const confirmarCancelacion = async () => {
    if (!pedidoACancelar) return;
    setActionLoading(true);
    setError(null);
    try {
      await cancelOrder(pedidoACancelar.id_pedido);
      setSuccessMessage("Pedido cancelado correctamente.");
      setConfirmCancelOpen(false);
      setPedidoACancelar(null);
      await fetchOrders(filtroFecha || undefined);
    } catch (err) {
      setError("No se pudo cancelar el pedido.");
    } finally {
      setActionLoading(false);
    }
  };

  const cerrarCancelacion = () => {
    if (actionLoading) return;
    setConfirmCancelOpen(false);
    setPedidoACancelar(null);
  };

  const marcarEntregado = async (pedido: OrderData) => {
    if (!pedido.shipment?.id_envio) return;
    setActionLoading(true);
    setError(null);
    try {
      await markShipmentDelivered(pedido.shipment.id_envio);
      setSuccessMessage("Pedido marcado como entregado.");
      await fetchOrders();
    } catch (err) {
      setError("No se pudo actualizar el estado del pedido.");
    } finally {
      setActionLoading(false);
    }
  };

  const manejarCambioFecha = (value: string) => {
    setFiltroFecha(value);
  };

  const limpiarFiltroFecha = () => {
    setFiltroFecha("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-64">
            <AdminSidebar />
          </aside>

          <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-extrabold text-black mb-6 border-b border-gray-100 pb-3">
              Gestión de Pedidos
            </h1>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-100 font-medium">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-100 font-medium">
                {successMessage}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                {/* CAMBIO: Texto negro en input */}
                <input
                  type="text"
                  placeholder="Buscar por ID o Cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] shadow-sm text-black"
                />
              </div>

              <div className="relative w-full md:w-48">
                {/* CAMBIO: Texto negro en select */}
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-black font-medium py-2 pl-4 pr-10 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] shadow-sm"
                >
                  <option value="Todos">Filtrar por Estado: Todos</option>
                  {estadosDisponibles
                    .filter((e) => e !== "Todos")
                    .map((estado) => (
                      <option key={estado} value={estado}>
                        {estadoStyles[estado]?.label || estado}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black"
                />
              </div>

               <div className="flex w-full md:w-auto items-center gap-2">
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => manejarCambioFecha(e.target.value)}
                  // CAMBIO: Texto negro
                  className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium"
                />
                <button
                  onClick={limpiarFiltroFecha}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-medium"
                  disabled={!filtroFecha}
                >
                  Limpiar filtro
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-gray-600 font-medium">Cargando pedidos...</div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-gray-600 font-medium">No hay pedidos disponibles.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* CAMBIO: Headers negros */}
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        ID Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Tipo Entrega
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedidosFiltrados.map((pedido) => (
                      <tr key={pedido.id_pedido} className="hover:bg-red-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                          #{pedido.id_pedido}
                        </td>
                        {/* CAMBIO: Texto oscuro */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                          {pedido.client
                            ? `${pedido.client.nombre || ""} ${pedido.client.apellido || ""}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#F40009]">
                          Bs. {formatMoney(pedido.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <EstadoBadge estado={pedido.estado} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium capitalize">
                          {pedido.tipo_entrega || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatFecha(pedido.fecha_creacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                            {pedido.shipment &&
                              !pedido.shipment.id_repartidor &&
                              formatEstadoClave(pedido.estado) !== "entregado" && (
                                <button
                                  onClick={() => abrirAsignacion(pedido)}
                                  className="text-blue-700 hover:text-blue-900 font-semibold transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                >
                                  Asignar Repartidor
                                </button>
                              )}
                            <button
                              onClick={() => abrirDetalle(pedido)}
                              className="text-gray-800 hover:text-black font-semibold transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                            >
                              Ver Detalle
                            </button>
                            {formatEstadoClave(pedido.estado) !== "entregado" &&
                              formatEstadoClave(pedido.estado) !== "cancelado" &&
                              formatEstadoClave(pedido.estado) !== "anulado" && (
                                <button
                                  onClick={() => abrirCancelacion(pedido)}
                                  className="text-red-600 hover:text-red-800 font-semibold transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                >
                                  Cancelar Pedido
                                </button>
                              )}
                            {pedido.shipment &&
                              formatEstadoClave(pedido.estado) === "en_camino" && (
                                <button
                                  onClick={() => marcarEntregado(pedido)}
                                  className="text-green-700 hover:text-green-900 font-semibold transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                >
                                  Marcar Entregado
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-800 font-medium">
              <span>
                Mostrando {pedidosFiltrados.length} de {orders.length} pedidos
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 border rounded-lg bg-[#F40009] text-white">1</button>
                <button className="px-3 py-1 border rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                  Siguiente
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {detalleAbierto && (
        // CAMBIO: Blur effect
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-100 pb-2">Detalle del Pedido</h2>
            {detalleLoading ? (
              <div className="py-6 text-center text-gray-600 font-medium">Cargando detalle...</div>
            ) : detalleData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  {/* CAMBIO: Etiquetas Negras Bold, Valores Gris Oscuro */}
                  <div>
                    <p className="text-black font-bold mb-1">Cliente</p>
                    <p className="text-gray-800 font-medium">
                      {detalleData.client
                        ? `${detalleData.client.nombre || ""} ${detalleData.client.apellido || ""}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-black font-bold mb-1">Método de Pago</p>
                    <p className="text-gray-800 font-medium capitalize">{detalleData.metodo_pago || "-"}</p>
                  </div>
                  <div>
                    <p className="text-black font-bold mb-1">Dirección de Entrega</p>
                    <p className="text-gray-800 font-medium">{detalleData.direccion_entrega || "-"}</p>
                  </div>
                  <div>
                    <p className="text-black font-bold mb-1">Tipo de Entrega</p>
                    <p className="text-gray-800 font-medium capitalize">{detalleData.tipo_entrega || "-"}</p>
                  </div>
                  <div>
                    <p className="text-black font-bold mb-1">Programación</p>
                    <p className="text-gray-800 font-medium">{formatFecha(detalleData.fecha_creacion)}</p>
                  </div>
                  <div>
                    <p className="text-black font-bold mb-1">Estado</p>
                    <div className="mt-1">
                      <EstadoBadge estado={detalleData.estado} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-black font-bold mb-3 text-base">Productos</p>
                  <div className="space-y-2 text-sm text-gray-800 font-medium">
                    {detalleData.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                        <span>
                          <span className="font-bold">({item.cantidad}x)</span> {item.product?.nombre_producto || "Producto"}
                        </span>
                        <span className="font-bold text-gray-900">Bs. {formatMoney(item.cantidad * item.precio_unitario)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right font-bold text-lg text-black border-t border-gray-200 pt-2">
                    TOTAL: <span className="text-[#F40009]">Bs. {formatMoney(detalleData.total)}</span>
                  </div>
                </div>

                {detalleData.shipment && (
                  <div className="border-t border-gray-200 pt-4 text-sm">
                    <p className="text-black font-bold mb-3 text-base">Información de Envío</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-black font-bold mb-1">ID Envío</p>
                        <p className="text-gray-800 font-medium">#{detalleData.shipment.id_envio}</p>
                      </div>
                      <div>
                        <p className="text-black font-bold mb-1">Estado de Envío</p>
                        <p className="text-gray-800 font-medium capitalize">{detalleData.shipment.estado_envio}</p>
                      </div>
                      <div>
                        <p className="text-black font-bold mb-1">Repartidor</p>
                        <p className="text-gray-800 font-medium">
                          {getDriverName(detalleData.shipment.id_repartidor)}
                        </p>
                      </div>
                      <div>
                        <p className="text-black font-bold mb-1">Sector</p>
                        <p className="text-gray-800 font-medium">{detalleData.shipment.sector || "-"}</p>
                      </div>
                      <div>
                        <p className="text-black font-bold mb-1">Fecha salida</p>
                        <p className="text-gray-800 font-medium">{formatFecha(detalleData.shipment.fecha_salida)}</p>
                      </div>
                      <div>
                        <p className="text-black font-bold mb-1">Fecha entrega</p>
                        <p className="text-gray-800 font-medium">{formatFecha(detalleData.shipment.fecha_entrega)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-600">No hay información disponible.</div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setDetalleAbierto(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-bold hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {assignOpen && selectedOrder && (
        // CAMBIO: Blur effect
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-black">Asignar Repartidor</h3>
            <p className="text-sm text-gray-800 font-medium mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
              Pedido ID: <span className="font-bold">#{selectedOrder.id_pedido}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Asignar a:</label>
              {/* CAMBIO: Select negro */}
              <select
                value={driverSeleccionado ?? ""}
                onChange={(e) => setDriverSeleccionado(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
              >
                <option value="">Selecciona un repartidor</option>
                {drivers.map((driver) => (
                  <option key={driver.id_usuario} value={driver.id_usuario}>
                    {driver.nombre} {driver.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setAssignOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-bold hover:bg-gray-50 transition"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAsignacion}
                disabled={!driverSeleccionado || actionLoading}
                className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-md"
              >
                {actionLoading ? "Guardando..." : "Confirmar Asignación"}
              </button>
            </div>
          </div>
        </div>
      )}
       <ConfirmModal
        isOpen={confirmCancelOpen}
        title="¿Anular Pedido?"
        message={
          pedidoACancelar?.id_pedido
            ? `Estás a punto de eliminar permanentemente el pedido #${pedidoACancelar.id_pedido}.`
            : "Estás a punto de eliminar permanentemente el pedido seleccionado."
        }
        description="Esta acción no se puede deshacer."
        confirmText="Sí, Anular"
        cancelText="No, Cancelar"
        onCancel={cerrarCancelacion}
        onConfirm={confirmarCancelacion}
        loading={actionLoading}
      />
    </div>
  );
}