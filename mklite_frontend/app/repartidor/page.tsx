"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import RepartidorSidebar from '../components/RepartidorSidebar';
//import { MapPin, Store, DollarSign, Power, Home, Clock, User, CheckCircle, Loader2 } from 'lucide-react';
//import { assignShipment, getAssignedShipments, getAvailableShipments } from '../services/shipment.service';
import { MapPin, Store, DollarSign, Power, Home, Clock, User, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import ShipmentDetailModal from '../components/ShipmentDetailModal';
import { Shipment } from '../types/shipment';
import { assignShipment, failShipment, getAssignedShipments, getAvailableShipments, getShipmentDetail, markShipmentDelivered, startShipmentRoute } from '../services/shipment.service';


export default function RepartidorPage() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [assignedShipments, setAssignedShipments] = useState<Shipment[]>([]);
  const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
  const [driverId, setDriverId] = useState<number | null>(null);
  const [driverName, setDriverName] = useState('Repartidor');
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser);
      setDriverId(parsed.id_usuario);
      setDriverName(`${parsed.nombre ?? ''} ${parsed.apellido ?? ''}`.trim() || 'Repartidor');
    } catch (error) {
      console.error('No se pudo leer userData', error);
    }
  }, []);

  useEffect(() => {
    if (!driverId) return;
    loadAssigned(driverId);
  }, [driverId]);

  useEffect(() => {
    if (!driverId || !isOnline) return;
    loadAvailable();
  }, [driverId, isOnline]);

  const loadAssigned = async (id: number) => {
    setLoadingAssigned(true);
    try {
      //const data = await getAssignedShipments(id, 'en_camino');
      //setAssignedShipments(data);
      const data: Shipment[] = await getAssignedShipments(id);
      const active = data.filter((shipment) => {
        const state = shipment.estado_envio?.toLowerCase?.() ?? '';
        return !['entregado', 'fallido', 'cancelado'].includes(state);
      });
      setAssignedShipments(active);
    } catch (error) {
      console.error('Error al cargar envíos asignados', error);
    } finally {
      setLoadingAssigned(false);
    }
  };

  const loadAvailable = async () => {
    setLoadingAvailable(true);
    try {
      const data = await getAvailableShipments();
      setAvailableShipments(data);
    } catch (error) {
      console.error('Error al cargar envíos disponibles', error);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAssign = async (shipmentId: number) => {
    if (!driverId) return;
    try {
      await assignShipment(shipmentId, driverId);
      await Promise.all([loadAssigned(driverId), loadAvailable()]);
    } catch (error) {
      console.error('No se pudo asignar el envío', error);
    }
  };

  const formatAddress = (shipment: Shipment) => shipment.order?.direccion_entrega || 'Sin dirección';

  const formatClient = (shipment: Shipment) => {
    const client = shipment.order?.client;
    if (!client) return 'Cliente sin nombre';
    return `${client.nombre ?? ''} ${client.apellido ?? ''}`.trim();
  };

  //const formatAmount = (shipment: Shipment) => shipment.order?.total ?? 0;
  const formatAmount = (shipment: Shipment) => {
    const raw = shipment.order?.total;
    return typeof raw === 'number' ? raw : raw ? parseFloat(raw) : 0;
  };

  const issueOptions = [
    { value: 'tiempo_expirado', label: 'Tiempo expirado (más de 15 min)' },
    { value: 'direccion_incorrecta', label: 'Dirección incorrecta / inaccesible' },
    { value: 'cliente_ausente', label: 'Cliente no contesta / ausente' },
    { value: 'error_pedido', label: 'Error en pedido (producto faltante, mal preparado)' },
    { value: 'otro', label: 'Otro (obliga nota)' },
  ];

  const resetReportForm = () => {
    setReportMode(false);
    setReportReason('');
    setReportNotes('');
    setReportError('');
  };

  const handleOpenDetail = async (shipmentId: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    resetReportForm();
    try {
      const data = await getShipmentDetail(shipmentId);
      setSelectedShipment(data);
    } catch (error) {
      console.error('Error al obtener detalle de envío', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshLists = async () => {
    if (!driverId) return;
    await Promise.all([
      loadAssigned(driverId),
      isOnline ? loadAvailable() : Promise.resolve(),
    ]);
  };

  const handleStartRoute = async (shipmentId: number) => {
    try {
      const updated = await startShipmentRoute(shipmentId);
      if (selectedShipment?.id_envio === shipmentId) {
        setSelectedShipment({ ...selectedShipment, ...updated });
      }
      await refreshLists();
    } catch (error) {
      console.error('Error al iniciar ruta', error);
    }
  };

  const handleMarkDelivered = async (shipmentId: number) => {
    try {
      await markShipmentDelivered(shipmentId);
      await refreshLists();
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Error al confirmar entrega', error);
    }
  };

  const requiresWait = (value: string) => ['tiempo_expirado', 'cliente_ausente'].includes(value);

  const validateReport = () => {
    if (!reportReason) return 'Selecciona un motivo para continuar.';

    if (reportReason === 'otro' && !reportNotes.trim()) {
      return 'Agrega una nota cuando el motivo es "Otro".';
    }

    if (requiresWait(reportReason)) {
      const start = selectedShipment?.fecha_salida ? new Date(selectedShipment.fecha_salida).getTime() : null;
      if (!start) return 'Aún no se registró una hora de salida para este envío.';
      const diffMinutes = (Date.now() - start) / 60000;
      if (diffMinutes < 15) {
        return `Solo han pasado ${Math.floor(diffMinutes)} minutos. Espera a que se cumplan 15 minutos antes de reportar.`;
      }
    }

    return '';
  };

  const handleSubmitReport = async () => {
    const errorMessage = validateReport();
    if (errorMessage) {
      setReportError(errorMessage);
      return;
    }

    if (!selectedShipment) return;

    try {
      await failShipment(selectedShipment.id_envio, reportReason, reportNotes);
      await refreshLists();
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Error al reportar problema', error);
      setReportError('No se pudo registrar el problema. Intenta nuevamente.');
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedShipment(null);
    resetReportForm();
  };

  const renderDetailActions = () => {
    if (!selectedShipment) return null;

    const lowerStatus = selectedShipment.estado_envio?.toLowerCase?.() ?? '';

    if (reportMode) {
      return (
        <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center text-orange-700 font-semibold">
            <AlertTriangle size={20} className="mr-2" /> Reportar Problema
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo principal</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Selecciona una opción</option>
                {issueOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notas adicionales</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Detalles opcionales"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>

            {reportError && (
              <div className="flex items-start text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle size={16} className="mr-2 mt-0.5" /> {reportError}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button
              onClick={handleSubmitReport}
              className="px-4 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600"
            >
              Confirmar reporte y marcar fallido
            </button>
            <button
              onClick={resetReportForm}
              className="px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="text-sm text-gray-500">
          {selectedShipment.failure_reason && (
            <span className="flex items-center text-red-600 font-semibold">
              <AlertTriangle size={16} className="mr-2" /> Reportado como: {selectedShipment.failure_reason}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          {lowerStatus === 'asignado' && (
            <button
              onClick={() => handleStartRoute(selectedShipment.id_envio)}
              className="px-4 py-3 bg-[#F40009] text-white font-bold rounded-lg shadow-md hover:bg-red-700"
            >
              Iniciar ruta
            </button>
          )}

          {lowerStatus === 'en_camino' && (
            <>
              <button
                onClick={() => handleMarkDelivered(selectedShipment.id_envio)}
                className="px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700"
              >
                Confirmar entrega
              </button>

              <button
                onClick={() => setReportMode(true)}
                className="px-4 py-3 bg-orange-100 text-orange-700 font-bold rounded-lg border border-orange-200 hover:bg-orange-200"
              >
                Reportar problema
              </button>
            </>
          )}

          <button
            onClick={closeDetail}
            className="px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };


  const renderShipments = (shipments: Shipment[], emptyLabel: string, showAssign = false) => {
    if (shipments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-gray-800 font-bold mb-2">{emptyLabel}</h3>
          <p className="text-gray-500 text-sm">Vuelve más tarde o recarga la lista.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <div key={shipment.id_envio} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700">#ENV-{shipment.id_envio}</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <CheckCircle size={12} className="mr-1" /> {shipment.estado_envio}
              </span>
            </div>

            <div className="p-4">
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-6 my-2">
                <div className="relative">
                  <div className="absolute -left-[21px] bg-white border-2 border-blue-500 w-3 h-3 rounded-full"></div>
                  <div className="flex items-start">
                    <Store size={18} className="text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">CLIENTE</p>
                      <p className="text-sm text-gray-800 font-medium">{formatClient(shipment)}</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] bg-white border-2 border-red-500 w-3 h-3 rounded-full"></div>
                  <div className="flex items-start">
                    <MapPin size={18} className="text-red-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">ENTREGAR EN</p>
                      <p className="text-sm text-gray-800 font-medium">{formatAddress(shipment)}</p>
                      </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-green-700 font-bold text-lg">
                  <DollarSign size={20} />
                  {(() => {
                    //const amount = formatAmount(shipment);
                    //const display = Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
                    const raw = shipment.order?.total;
                    const amount = typeof raw === 'number' ? raw : parseFloat(String(raw));
                    const display = Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
                    return <span>Bs. {display}</span>;
                  })()}
                </div>
                <span className="text-xs text-gray-500">Pedido #{shipment.order?.id_pedido ?? '-'}</span>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleOpenDetail(shipment.id_envio)}
                  className="text-sm font-semibold text-[#F40009] hover:underline"
                >
                  Ver detalle
                </button>
              </div>


              {showAssign && (
                <button
                  onClick={() => handleAssign(shipment.id_envio)}
                  className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg active:scale-95"
                >
                  Aceptar Pedido
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto lg:max-w-full">
          <div className="max-w-md mx-auto w-full flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">Bienvenido de nuevo,</p>
              <h1 className="text-xl font-bold text-gray-800">{driverName}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div
                onClick={() => setIsOnline(!isOnline)}
                className={`cursor-pointer flex items-center rounded-full p-1 w-24 transition-colors duration-300 ${isOnline ? 'bg-green-100 border border-green-200' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-16 bg-green-500' : 'translate-x-0 bg-gray-400'}`}></div>
                <span className={`absolute text-xs font-bold ${isOnline ? 'ml-7 text-green-700' : 'ml-1.5 text-gray-500'}`}>
                  {isOnline ? 'En línea' : 'Offline'}
                </span>
              </div>

              <button className="p-2 bg-red-50 rounded-full text-red-600 hover:bg-red-100 transition">
                <Power size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

       <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-64">
            <RepartidorSidebar />
          </aside>

          <main className="flex-1 space-y-8">
            <section className="max-w-md lg:max-w-full mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-700">Pedidos asignados</h2>
                {loadingAssigned && <Loader2 className="animate-spin text-gray-500" size={20} />}
              </div>
              {renderShipments(assignedShipments, 'No tienes envíos en curso')}
            </section>

            <section className="max-w-md lg:max-w-full mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-700">Pedidos Disponibles</h2>
                {loadingAvailable && <Loader2 className="animate-spin text-gray-500" size={20} />}
              </div>
              {!isOnline ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Power size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-800 font-bold mb-2">Estás desconectado</h3>
                  <p className="text-gray-500 text-sm">Conéctate para empezar a recibir pedidos cercanos.</p>
            </div>
              ) : (
                renderShipments(availableShipments, 'No hay pedidos disponibles ahora', true)
              )}
            </section>
          </main>
        </div>
      </div>
      {isDetailOpen && (
        <ShipmentDetailModal
          isOpen={isDetailOpen}
          onClose={closeDetail}
          loading={detailLoading}
          shipment={selectedShipment}
          actions={renderDetailActions()}
        />
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-20 lg:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto py-3">
          

          <Link
            href="/repartidor"
            onClick={() => setActiveTab("inicio")}
            className={`flex flex-col items-center space-y-1 ${activeTab === "inicio" ? "text-[#F40009]" : "text-gray-400"}`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Inicio</span>
          </Link>

          <Link
            href="/repartidor/historial"
            onClick={() => setActiveTab("historial")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "historial" ? "text-[#F40009]" : "text-gray-400"
            }`}
          >
            <Clock size={24} />
            <span className="text-xs font-medium">Historial</span>
          </Link>

          <Link
            href="/repartidor/perfil"
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === "perfil" ? "text-[#F40009]" : "text-gray-400"
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
     </div>
    </div>
  );
}     