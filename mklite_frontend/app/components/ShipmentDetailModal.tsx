"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Shipment } from "../types/shipment";
interface ShipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  loading?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const formatCurrency = (value?: number | string) => {
  const parsed = typeof value === "number" ? value : value ? parseFloat(value) : 0;
  const display = Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
  return `Bs. ${display}`;
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "Sin registrar";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registrar";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const getClientName = (shipment: Shipment | null) => {
  const client = shipment?.order?.client;
  if (!client) return "Cliente sin nombre";
  return `${client.nombre ?? ""} ${client.apellido ?? ""}`.trim();
};

const getClientPhone = (shipment: Shipment | null) => shipment?.order?.client?.telefono ?? "Sin teléfono";

const getAddress = (shipment: Shipment | null) =>
  shipment?.order?.direccion_entrega || shipment?.order?.client?.direccion || "Sin dirección";

const getClientNote = (shipment: Shipment | null) =>
  shipment?.order?.nota_cliente || shipment?.order?.notas || "";

const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  isOpen,
  onClose,
  shipment,
  loading = false,
  children,
  actions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#F40009]" size={36} />
          </div>
        ) : shipment ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Detalle del Pedido</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  #{shipment.order?.id_pedido ?? shipment.id_envio}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 capitalize">
                {shipment.estado_envio?.replace("_", " ") ?? "—"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Datos del Cliente</h3>
                <p className="text-sm text-gray-600 font-semibold">{getClientName(shipment)}</p>
                <p className="text-sm text-gray-600">{getClientPhone(shipment)}</p>
                <p className="text-sm text-gray-600 mt-2">{getAddress(shipment)}</p>
                {getClientNote(shipment) && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Nota del cliente:</span> {getClientNote(shipment)}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Datos del Envío</h3>
                <p className="text-sm text-gray-600">Método de pago: {shipment.order?.metodo_pago ?? "—"}</p>
                <p className="text-sm text-gray-600">Tipo de entrega: {shipment.order?.tipo_entrega ?? "—"}</p>
                <p className="text-sm text-gray-600">Sector: {shipment.sector ?? "—"}</p>
                <p className="text-sm text-gray-600">Estado: {shipment.estado_envio ?? "—"}</p>
                <p className="text-sm text-gray-600">
                  Salida: {formatDateTime(shipment.fecha_salida ?? null)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Productos del pedido</h3>
                <span className="text-sm text-gray-600">Método: {shipment.order?.metodo_pago ?? "—"}</span>
              </div>
              <div className="space-y-2">
                {shipment.order?.items?.length ? (
                  shipment.order.items.map((item) => {
                    const key = item.id_item ?? `${item.product?.nombre}-${item.cantidad}`;
                    const price = formatCurrency(item.precio_unitario ?? 0);
                    return (
                      <div key={key} className="flex justify-between text-sm text-gray-700">
                        <span>
                          {item.cantidad}x {item.product?.nombre ?? "Producto"}
                        </span>
                        <span>{price}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No hay productos asociados.</p>
                )}
                <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-3">
                  <span>Total cobrado</span>
                  <span>{formatCurrency(shipment.order?.total)}</span>
                </div>
              </div>
            </div>

            {children}

            {actions !== undefined ? (
              actions
            ) : (
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">No se encontró la información del envío.</p>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetailModal;