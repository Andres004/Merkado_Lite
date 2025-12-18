"use client";

import React, { useEffect, useMemo, useState } from 'react';
import RepartidorSidebar from '../../components/RepartidorSidebar';
import { Search, Loader2 } from 'lucide-react';
import ShipmentDetailModal from '../../components/ShipmentDetailModal';
import { getShipmentDetail, getShipmentHistory } from '../../services/shipment.service';
import { Shipment } from '../../types/shipment';

//type DateFilter = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth';
type DateFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth';

const EstadoBadge = ({ estado }: { estado: string }) => {
    const delivered = estado.toLowerCase() === 'entregado' || estado.toLowerCase() === 'entregada';
    const color = delivered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${color}`}>
        {estado}
        </span>
    );
};

export default function RepartidorHistorialPage() {
    const [history, setHistory] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [driverId, setDriverId] = useState<number | null>(null);
    const [activeStatus, setActiveStatus] = useState<'entregado' | 'fallido'>('entregado');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    //const [dateFilter, setDateFilter] = useState<DateFilter>('last7');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) return;
        try {
        const parsed = JSON.parse(storedUser);
            setDriverId(parsed.id_usuario);
        } catch (error) {
            console.error('No se pudo leer userData', error);
        }
    }, []);

    useEffect(() => {
        if (!driverId) return;
        loadHistory(driverId, activeStatus);
    }, [driverId, activeStatus]);

    //const loadHistory = async (id: number) => {
    const loadHistory = async (id: number, estado: 'entregado' | 'fallido') => {
        setLoading(true);
        try {
        const data = await getShipmentHistory(id, estado);
            setHistory(data);
        } catch (error) {
        console.error('Error al cargar historial', error);
        } finally {
           setLoading(false);
        }
    };

    const formatCurrency = (value?: number | string) => {
        const parsed = typeof value === 'number' ? value : value ? parseFloat(value) : 0;
        const display = Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
        return display;
    };

    const formatDateTime = (value?: string | Date | null) => {
        if (!value) return 'Sin fecha';
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return 'Sin fecha';
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const getShipmentDate = (item: Shipment) => {
        const dateSource = item.failure_reported_at ?? item.fecha_entrega;
        if (!dateSource) return null;
        const parsedDate = new Date(dateSource);
        if (Number.isNaN(parsedDate.getTime())) return null;
        return parsedDate;
    };

    const getDateRange = (filter: DateFilter) => {
    const now = new Date();

    // all => no filtrar por fecha
    if (filter === 'all') {
        return { start: null as Date | null, end: null as Date | null };
    }

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (filter) {
        case 'today':
        return { start, end };
        case 'yesterday': {
        const yesterdayStart = new Date(start);
        yesterdayStart.setDate(start.getDate() - 1);
        const yesterdayEnd = new Date(end);
        yesterdayEnd.setDate(end.getDate() - 1);
        return { start: yesterdayStart, end: yesterdayEnd };
        }
        case 'last30': {
        const last30Start = new Date(start);
        last30Start.setDate(start.getDate() - 29);
        return { start: last30Start, end };
        }
        case 'thisMonth': {
        const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start: monthStart, end: monthEnd };
        }
        case 'last7':
        default: {
        const last7Start = new Date(start);
        last7Start.setDate(start.getDate() - 6);
        return { start: last7Start, end };
        }
    }
    };

    const formatClient = (item: Shipment) => {
        const client = item.order?.client;
        if (!client) return 'Cliente sin nombre';
        return `${client.nombre ?? ''} ${client.apellido ?? ''}`.trim();
    };

    //const formatAmount = (item: ShipmentHistory) => item.order?.total ?? 0;
    const formatAmount = (item: Shipment) => item.order?.total ?? 0;


    const formatDate = (item: Shipment) => {
       const date = getShipmentDate(item);
        return formatDateTime(date ?? null);
    };

    const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

    const filteredHistory = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const isNumericQuery = query !== '' && !Number.isNaN(Number(query));

        return history.filter((item) => {
            const shipmentDate = getShipmentDate(item);
            if (!shipmentDate) return false;

            //if (shipmentDate < dateRange.start || shipmentDate > dateRange.end) {
            //    return false;
            //}
            if (dateRange.start && dateRange.end) {
                if (shipmentDate < dateRange.start || shipmentDate > dateRange.end) {
                    return false;
                }
            }

            if (!query) return true;

            if (isNumericQuery) {
                const ids = [item.order?.id_pedido, item.id_envio];
                return ids.some((id) =>
                    id !== undefined && id !== null && id.toString().toLowerCase().includes(query)
                );
            }

            const clientName = `${item.order?.client?.nombre ?? ''} ${item.order?.client?.apellido ?? ''}`
                .trim()
                .toLowerCase();
            return clientName.includes(query);
        });
    }, [history, dateRange, searchTerm]);

    const handleOpenDetail = async (shipmentId: number) => {
        setIsDetailOpen(true);
        setDetailLoading(true);
        try {
            const data = await getShipmentDetail(shipmentId);
            setSelectedShipment(data);
        } catch (error) {
            console.error('Error al cargar detalle del historial', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        setSelectedShipment(null);
    };

    const renderHistoryExtras = () => {
        if (!selectedShipment) return null;
        const isFailed = selectedShipment.estado_envio?.toLowerCase() === 'fallido';
        if (!isFailed) return null;

        //const reportedAt = selectedShipment.failure_reported_at ?? selectedShipment.fecha_entrega ?? selectedShipment.order?.fecha_actualizacion;
        const reportedAt = selectedShipment.failure_reported_at ?? selectedShipment.fecha_entrega;

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-red-700">Reporte de entrega fallida</h3>
                <p className="text-sm text-gray-700"><span className="font-semibold">Motivo:</span> {selectedShipment.failure_reason ?? '—'}</p>
                {selectedShipment.failure_notes && (
                    <p className="text-sm text-gray-700"><span className="font-semibold">Notas del repartidor:</span> {selectedShipment.failure_notes}</p>
                )}
                <p className="text-sm text-gray-700"><span className="font-semibold">Fecha del reporte:</span> {formatDateTime(reportedAt ?? null)}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-64">
                <RepartidorSidebar />
            </aside>

                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Historial de Entregas Finalizadas</h1>
                        {loading && <Loader2 className="animate-spin text-gray-500" />}
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 shadow-sm">
                                <label htmlFor="date-filter" className="mr-2 font-semibold text-gray-600">
                                    Rango:
                                </label>
                                <select
                                    id="date-filter"
                                    value={dateFilter}
                                    onChange={(event) => setDateFilter(event.target.value as DateFilter)}
                                    className="bg-transparent focus:outline-none"
                                >
                                    <option value="all">Todos</option>
                                    <option value="today">Hoy</option>
                                    <option value="yesterday">Ayer</option>
                                    <option value="last7">Últimos 7 días</option>
                                    <option value="last30">Últimos 30 días</option>
                                    <option value="thisMonth">Este mes</option>
                                </select>
                            </div>

                            <div className="relative flex-grow">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por ID o Cliente"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                            />
                            </div>
                        </div>
                        </div>

                        <div className="flex space-x-2 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveStatus('entregado')}
                            className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeStatus === 'entregado' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 border-b-white'}`}
                        >
                            Entregados Exitosamente
                        </button>
                        <button
                            onClick={() => setActiveStatus('fallido')}
                            className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${activeStatus === 'fallido' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 border-b-white'}`}
                        >
                            Fallidos / No Entregados
                        </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                     <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID PEDIDO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MONTO COBRADO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA/HORA DE CIERRE</th>
                                        {activeStatus === 'fallido' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MOTIVO</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id_envio} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            #{item.order?.id_pedido ?? item.id_envio}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {formatClient(item)}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                            Bs. {formatCurrency(formatAmount(item))}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(item)}
                                            </td>

                                            {activeStatus === "fallido" && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {item.failure_reason ?? "—"}
                                            </td>
                                            )}

                                            <td className="px-6 py-4 whitespace-nowrap">
                                            <EstadoBadge estado={item.estado_envio} />
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span
                                                onClick={() => handleOpenDetail(item.id_envio)}
                                                className="text-gray-500 hover:text-[#F40009] hover:underline cursor-pointer"
                                            >
                                                Ver Detalle
                                            </span>
                                            </td>
                                        </tr>
                                        ))}

                                        {filteredHistory.length === 0 && !loading && (
                                        <tr>
                                            <td
                                            colSpan={activeStatus === "fallido" ? 7 : 6}
                                            className="text-center text-gray-500 py-6"
                                            >
                                            No hay entregas finalizadas para mostrar.
                                            </td>
                                        </tr>
                                        )}

                                 
                                
                                </tbody>
                            </table>
                        </div>
                        {isDetailOpen && (
                            <ShipmentDetailModal
                                isOpen={isDetailOpen}
                                onClose={closeDetail}
                                loading={detailLoading}
                                shipment={selectedShipment}
                            >
                                {renderHistoryExtras()}
                            </ShipmentDetailModal>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}