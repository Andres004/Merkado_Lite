"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Download,
  FileDown,
  Loader2,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  downloadDailyInventoryCsv,
  downloadDailyOrdersCsv,
  downloadDailyPdf,
  fetchDailyReport,
} from "../../../services/report.service";

interface Summary {
  totalVentas: number;
  totalPedidos: number;
  totalEnvios: number;
  subtotalTotal: number;
  ticketPromedio: number;
  estadosConsiderados: string[];
}

interface OrderRow {
  id_pedido: number;
  fecha_creacion: string;
  cliente?: string | null;
  estado: string;
  tipo_entrega: string;
  metodo_pago: string;
  total: number;
}

interface TopProductRow {
  id_producto: number;
  nombre: string;
  unidades: number;
  revenue: number;
}

interface InventoryRow {
  id_producto: number;
  producto: string;
  stock: number;
  stock_minimo: number;
  estado: "OK" | "BAJO";
}

interface DailyReport {
  date: string;
  summary: Summary;
  orders: OrderRow[];
  topProducts: TopProductRow[];
  inventorySnapshot: InventoryRow[];
  lowStock: InventoryRow[];
}

const formatCurrency = (value: number) =>
  `Bs. ${Number(value || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const todayStr = new Date().toISOString().slice(0, 10);

// CAMBIO VISUAL: Textos oscuros en las tarjetas
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  accentClass: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
    <div className={`p-3 rounded-lg ${accentClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      {/* CAMBIO: text-gray-500 a text-gray-900 */}
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {/* CAMBIO: text-gray-400 a text-gray-700 */}
      <p className="text-xs text-gray-700 font-medium">{subtitle}</p>
    </div>
  </div>
);

const DownloadButton = ({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F40009] text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-60"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
    {label}
  </button>
);

const DailyReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [estadoFiltro, setEstadoFiltro] = useState("entregado");
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDailyReport(selectedDate, estadoFiltro);
      setReport(data);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "No se pudo cargar el reporte";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (type: "pdf" | "orders" | "inventory") => {
    setError("");
    setDownloading(type);
    try {
      const downloader =
        type === "pdf"
          ? downloadDailyPdf
          : type === "orders"
          ? downloadDailyOrdersCsv
          : downloadDailyInventoryCsv;

      const blob = await downloader(selectedDate, estadoFiltro);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const suffix =
        type === "pdf"
          ? "reporte-diario.pdf"
          : type === "orders"
          ? "pedidos.csv"
          : "inventario.csv";

      link.download = `${selectedDate}-${suffix}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "No se pudo descargar el archivo";
      setError(message);
    } finally {
      setDownloading(null);
    }
  };

  const ticketPromedio = useMemo(() => report?.summary?.ticketPromedio ?? 0, [report]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Ventas del día",
        value: formatCurrency(report?.summary?.totalVentas ?? 0),
        subtitle:
          "Estados: " + (report?.summary?.estadosConsiderados?.join(", ") ?? "entregado"),
        icon: ShoppingBag,
        accentClass: "bg-red-50 text-red-700",
      },
      {
        title: "Pedidos",
        value: String(report?.summary?.totalPedidos ?? 0),
        subtitle: "Pedidos cerrados fecha",
        icon: ClipboardList,
        accentClass: "bg-blue-50 text-blue-700",
      },
      {
        title: "Ticket promedio",
        value: formatCurrency(ticketPromedio),
        subtitle: "totalVentas / totalPedidos",
        icon: Calendar,
        accentClass: "bg-emerald-50 text-emerald-700",
      },
      {
        title: "Costo de envíos",
        value: formatCurrency(report?.summary?.totalEnvios ?? 0),
        subtitle: "Suma de costo_envio",
        icon: PackageSearch,
        accentClass: "bg-amber-50 text-amber-700",
      },
    ],
    [report, ticketPromedio],
  );

  const currentLowStock = report?.lowStock ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <AdminSidebar />
        </div>

        <div className="lg:col-span-9">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {/* CAMBIO: Titulo negro y subtitulo oscuro */}
                <h1 className="text-2xl font-bold text-black">Reporte económico diario</h1>
                <p className="text-sm text-gray-800 font-medium">
                  Selecciona una fecha para ver el resumen y exportar archivos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black font-medium"
                />
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black font-medium"
                >
                  <option value="entregado">Solo entregado (ventas reales)</option>
                  <option value="entregado,procesando">Entregado + procesando</option>
                  <option value="procesando">Solo procesando</option>
                </select>
                <button
                  onClick={loadReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F40009] text-white text-sm font-medium hover:bg-red-600 transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Ver reporte
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-sm text-red-700 border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {summaryCards.map((card) => (
                <StatCard key={card.title} {...card} />
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <DownloadButton
                label="Descargar PDF"
                onClick={() => handleDownload("pdf")}
                loading={downloading === "pdf"}
              />
              <DownloadButton
                label="Descargar Pedidos CSV"
                onClick={() => handleDownload("orders")}
                loading={downloading === "orders"}
              />
              <DownloadButton
                label="Descargar Inventario CSV"
                onClick={() => handleDownload("inventory")}
                loading={downloading === "inventory"}
              />
            </div>

            {/* ====== TABLAS ====== */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* PEDIDOS */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black">Pedidos del día</h3>
                  {/* CAMBIO: Texto oscuro */}
                  <span className="text-sm text-gray-800 font-medium">{report?.orders?.length ?? 0} registros</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm table-fixed">
                    <thead>
                      {/* CAMBIO: Encabezados NEGROS */}
                      <tr className="text-left text-gray-900 font-bold border-b border-gray-200">
                        <th className="py-2 px-3 w-[70px] whitespace-nowrap">ID</th>
                        <th className="py-2 px-3 w-[90px] whitespace-nowrap">Hora</th>
                        <th className="py-2 px-3 w-[200px]">Cliente</th>
                        <th className="py-2 px-3 w-[110px] whitespace-nowrap">Estado</th>
                        <th className="py-2 px-3 w-[110px] whitespace-nowrap">Entrega</th>
                        <th className="py-2 px-3 w-[110px] whitespace-nowrap">Pago</th>
                        <th className="py-2 px-3 w-[120px] whitespace-nowrap text-right">Total</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-900 font-medium">
                      {(report?.orders ?? []).map((order) => {
                        const hora = order.fecha_creacion
                          ? new Date(order.fecha_creacion).toLocaleTimeString("es-BO", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";

                        return (
                          <tr key={order.id_pedido} className="border-t border-gray-100 align-middle hover:bg-gray-50">
                            <td className="py-2 px-3 whitespace-nowrap font-bold">#{order.id_pedido}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-gray-800">{hora}</td>

                            {/* Cliente */}
                            <td className="py-2 px-3">
                              <div className="max-w-[200px] truncate text-gray-900" title={order.cliente ?? "Sin cliente"}>
                                {order.cliente ?? "Sin cliente"}
                              </div>
                            </td>

                            <td className="py-2 px-3 whitespace-nowrap text-gray-800">{order.estado}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-gray-800">{order.tipo_entrega}</td>
                            <td className="py-2 px-3 whitespace-nowrap text-gray-800">{order.metodo_pago}</td>

                            <td className="py-2 px-3 whitespace-nowrap text-right font-bold text-gray-900">
                              {formatCurrency(order.total)}
                            </td>
                          </tr>
                        );
                      })}

                      {!report?.orders?.length && (
                        <tr>
                          {/* CAMBIO: Texto oscuro */}
                          <td className="py-3 px-3 text-center text-gray-700 font-medium" colSpan={7}>
                            No hay pedidos para la fecha seleccionada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                
              </div>

              {/* TOP PRODUCTOS */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black">Top productos</h3>
                  {/* CAMBIO: Texto oscuro */}
                  <span className="text-sm text-gray-800 font-medium">{report?.topProducts?.length ?? 0} ítems</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      {/* CAMBIO: Encabezados NEGROS */}
                      <tr className="text-left text-gray-900 font-bold border-b border-gray-200">
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 whitespace-nowrap">Unidades</th>
                        <th className="py-2 px-3 whitespace-nowrap text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900">
                      {(report?.topProducts ?? []).map((item) => (
                        <tr key={item.id_producto} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{item.nombre}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-medium">{item.unidades}</td>
                          <td className="py-2 px-3 whitespace-nowrap text-right font-bold">
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                      {!report?.topProducts?.length && (
                        <tr>
                          <td className="py-3 px-3 text-center text-gray-700 font-medium" colSpan={3}>
                            No hay productos vendidos en la fecha.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* INVENTARIO + ALERTAS */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-black">Inventario (snapshot actual)</h3>
                  <span className="text-sm text-gray-800 font-medium">{report?.inventorySnapshot?.length ?? 0} productos</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      {/* CAMBIO: Encabezados NEGROS */}
                      <tr className="text-left text-gray-900 font-bold border-b border-gray-200">
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 whitespace-nowrap">Stock</th>
                        <th className="py-2 px-3 whitespace-nowrap">Mínimo</th>
                        <th className="py-2 px-3 whitespace-nowrap">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900">
                      {(report?.inventorySnapshot ?? []).map((item) => (
                        <tr key={item.id_producto} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{item.producto}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-medium">{item.stock}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{item.stock_minimo}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                item.estado === "BAJO" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!report?.inventorySnapshot?.length && (
                        <tr>
                          <td className="py-3 px-3 text-center text-gray-700 font-medium" colSpan={4}>
                            No hay inventario registrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-lg font-bold text-black">Alertas stock mínimo</h3>
                  </div>
                  <span className="text-sm text-gray-800 font-medium">{currentLowStock.length} alertas</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      {/* CAMBIO: Encabezados NEGROS */}
                      <tr className="text-left text-gray-900 font-bold border-b border-gray-200">
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 whitespace-nowrap">Stock</th>
                        <th className="py-2 px-3 whitespace-nowrap">Mínimo</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900">
                      {currentLowStock.map((item) => (
                        <tr key={item.id_producto} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{item.producto}</td>
                          <td className="py-2 px-3 whitespace-nowrap font-bold text-red-600">{item.stock}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{item.stock_minimo}</td>
                        </tr>
                      ))}
                      {!currentLowStock.length && (
                        <tr>
                          <td className="py-3 px-3 text-center text-gray-700 font-medium" colSpan={3}>
                            Sin alertas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* ====== FIN TABLAS ====== */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportPage;