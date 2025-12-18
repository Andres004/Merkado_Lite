'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Mail, Home } from "lucide-react";
import { clearConfirmationState, getConfirmationState } from "../utils/checkoutStorage";
import { downloadInvoiceService, sendInvoiceEmailService } from "../services/invoice.service";

export default function ConfirmationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(getConfirmationState());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getConfirmationState();
    if (!stored) {
      router.replace('/');
      return;
    }
    setState(stored);
    setLoading(false);
  }, [router]);

  const handleDownload = async () => {
    if (!state?.canInvoice) return;
    try {
      const response = await downloadInvoiceService(state.orderId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${state.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('No pudimos descargar la factura.');
    }
  };

  const handleSendEmail = async () => {
    if (!state?.canInvoice || !state.orderId) return;
    setSending(true);
    setError(null);
    try {
      await sendInvoiceEmailService(state.orderId, state.userEmail);
    } catch (err) {
      setError('No pudimos enviar la factura por correo.');
    } finally {
      setSending(false);
    }
  };

  const paymentMessage = state?.paymentMethod === 'efectivo'
    ? 'Paga al recibir tu pedido'
    : 'Tu pago fue verificado';

  if (loading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 bg-gray-50">
        Cargando confirmación...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="flex items-center gap-1 text-[#F40009] hover:underline">
            <Home className="w-4 h-4" /> Inicio
          </Link>
          <span>/</span>
          <span className="font-semibold">Confirmación</span>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-green-100 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">¡Gracias por tu pedido!</h1>
          <p className="text-gray-600 mt-2">Pedido #{state.orderId}</p>
          <p className="text-gray-700 mt-2 font-medium">{paymentMessage}</p>
          <p className="text-gray-600 mt-1">
            Total pagado: <span className="text-[#F40009] font-semibold">Bs. {state.total?.toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">La factura solo se emite para pagos electrónicos.</p>

          {error && (
            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-center">
            {state.canInvoice && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-800"
                >
                  <Download className="w-4 h-4" /> Descargar factura (PDF)
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F40009] text-white hover:bg-red-700 disabled:opacity-70"
                >
                  <Mail className="w-4 h-4" /> {sending ? 'Enviando...' : 'Enviar factura al correo'}
                </button>
              </>
            )}
          </div>

          {state.paymentMethod === 'efectivo' && (
            <div className="mt-4 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 inline-flex">
              Recuerda pagar en efectivo cuando recibas tu pedido. No se generó factura.
            </div>
          )}

          <div className="mt-8">
            <Link href="/" onClick={() => clearConfirmationState()}>
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition shadow-sm">
                Volver al inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}