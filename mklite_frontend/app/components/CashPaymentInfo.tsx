'use client';

import { Wallet } from "lucide-react";

export default function CashPaymentInfo() {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-[#F40009] font-bold">
        <Wallet className="w-5 h-5" /> Pago en efectivo
      </div>
      <p className="text-sm text-gray-600">
        No es necesario realizar un pago. Confirmaremos el pedido y pagarás cuando recibas tu entrega.
      </p>
      <p className="text-xs text-gray-500 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg border border-orange-100">
        La factura no se genera ni se envía por correo para pedidos en efectivo.
      </p>
    </div>
  );
}