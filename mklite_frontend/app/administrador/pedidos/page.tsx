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
    text: "text-yellow-700",
    icon: Clock,
    label: "Pendiente",
  },
  procesando: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
    label: "Pendiente",
  },
  asignado: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Truck,
    label: "Asignado",
  },
  en_camino: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Truck,
    label: "En Camino",
  },
  entregado: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    label: "Entregado",
  },
  cancelado: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Cancelado",
  },
  anulado: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Cancelado",
  },
  fallido: {
    bg: "bg-gray-200",
    text: "text-gray-700",
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
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}
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

//const formatMoney = (value: number) => value.toFixed(2);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-700 font-semibold">{message}</p>
          {description && <p className="text-gray-500 text-sm">{description}</p>}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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
      const data: UserData[] = response?.data || [];
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

          <main className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
              Gestión de Pedidos
            </h1>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {successMessage}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por ID o Cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                />
              </div>

              <div className="relative w-full md:w-48">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                />
              </div>

               <div className="flex w-full md:w-auto items-center gap-2">
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => manejarCambioFecha(e.target.value)}
                  className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={limpiarFiltroFecha}
                  className="px-3 py-2 text-sm border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  disabled={!filtroFecha}
                >
                  Limpiar filtro
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Cargando pedidos...</div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay pedidos disponibles.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        ID Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tipo Entrega
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pedidosFiltrados.map((pedido) => (
                      <tr key={pedido.id_pedido} className="hover:bg-red-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{pedido.id_pedido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pedido.client
                            ? `${pedido.client.nombre || ""} ${pedido.client.apellido || ""}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#F40009]">
                          Bs. {formatMoney(pedido.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <EstadoBadge estado={pedido.estado} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {pedido.tipo_entrega || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatFecha(pedido.fecha_creacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                            {pedido.shipment &&
                              !pedido.shipment.id_repartidor &&
                              formatEstadoClave(pedido.estado) !== "entregado" && (
                                <button
                                  onClick={() => abrirAsignacion(pedido)}
                                  className="text-blue-600 hover:text-blue-800 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                >
                                  Asignar Repartidor
                                </button>
                              )}
                            <button
                              onClick={() => abrirDetalle(pedido)}
                              className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                            >
                              Ver Detalle
                            </button>
                            {formatEstadoClave(pedido.estado) !== "entregado" &&
                              formatEstadoClave(pedido.estado) !== "cancelado" &&
                              formatEstadoClave(pedido.estado) !== "anulado" && (
                                <button
                                  onClick={() => abrirCancelacion(pedido)}
                                  className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                >
                                  Cancelar Pedido
                                </button>
                              )}
                            {pedido.shipment &&
                              formatEstadoClave(pedido.estado) === "en_camino" && (
                                <button
                                  onClick={() => marcarEntregado(pedido)}
                                  className="text-green-600 hover:text-green-800 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
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

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>
                Mostrando {pedidosFiltrados.length} de {orders.length} pedidos
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded-lg bg-gray-100" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 border rounded-lg bg-[#F40009] text-white">1</button>
                <button className="px-3 py-1 border rounded-lg bg-gray-100" disabled>
                  Siguiente
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {detalleAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
            <h2 className="text-2xl font-bold mb-4">Detalle del Pedido</h2>
            {detalleLoading ? (
              <div className="py-6 text-center text-gray-500">Cargando detalle...</div>
            ) : detalleData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cliente</p>
                    <p className="font-semibold">
                      {detalleData.client
                        ? `${detalleData.client.nombre || ""} ${detalleData.client.apellido || ""}`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Método de Pago</p>
                    <p className="font-semibold capitalize">{detalleData.metodo_pago || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dirección de Entrega</p>
                    <p className="font-semibold">{detalleData.direccion_entrega || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo de Entrega</p>
                    <p className="font-semibold capitalize">{detalleData.tipo_entrega || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Programación</p>
                    <p className="font-semibold">{formatFecha(detalleData.fecha_creacion)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estado</p>
                    <EstadoBadge estado={detalleData.estado} />
                  </div>
                </div>

                <div>
                  <p className="text-gray-700 font-semibold mb-2">Productos</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    {detalleData.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          ({item.cantidad}x) {item.product?.nombre_producto || "Producto"}
                        </span>
                        <span>Bs. {formatMoney(item.cantidad * item.precio_unitario)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right font-semibold">
                    TOTAL: Bs. {formatMoney(detalleData.total)}
                  </div>
                </div>

                {detalleData.shipment && (
                  <div className="border-t pt-3 text-sm">
                    <p className="text-gray-700 font-semibold mb-2">Envío</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500">ID Envío</p>
                        <p className="font-semibold">#{detalleData.shipment.id_envio}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estado de Envío</p>
                        <p className="font-semibold capitalize">{detalleData.shipment.estado_envio}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Repartidor</p>
                        <p className="font-semibold">
                          {getDriverName(detalleData.shipment.id_repartidor)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sector</p>
                        <p className="font-semibold">{detalleData.shipment.sector || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha salida</p>
                        <p className="font-semibold">{formatFecha(detalleData.shipment.fecha_salida)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha entrega</p>
                        <p className="font-semibold">{formatFecha(detalleData.shipment.fecha_entrega)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">No hay información disponible.</div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setDetalleAbierto(false)}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {assignOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Asignar Repartidor</h3>
            <p className="text-sm text-gray-600 mb-2">Pedido ID: #{selectedOrder.id_pedido}</p>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Asignar a:</label>
              <select
                value={driverSeleccionado ?? ""}
                onChange={(e) => setDriverSeleccionado(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
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
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAsignacion}
                disabled={!driverSeleccionado || actionLoading}
                className="px-4 py-2 rounded-lg bg-[#F40009] text-white hover:bg-red-600 disabled:opacity-50"
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