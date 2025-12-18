'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle, CreditCard, QrCode, Wallet } from "lucide-react";

import QrPaymentMock from "../components/QrPaymentMock";
import CardPaymentMock from "../components/CardPaymentMock";
import CashPaymentInfo from "../components/CashPaymentInfo";
import { createOrderService } from "../services/order.service";
import { deleteCartItemService } from "../services/cart.service";
import {
  PaymentMethod,
  PaymentStatus,
  clearPendingCheckout,
  getPendingCheckout,
  saveConfirmationState,
  updatePendingCheckout,
} from "../utils/checkoutStorage";
import { sendInvoiceEmailService } from "../services/invoice.service";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  useEffect(() => {
    const draft = getPendingCheckout();
    if (!draft) {
      router.replace('/checkout');
      return;
    }
    setPaymentMethod(draft.paymentMethod ?? 'qr');
    setPaymentStatus(draft.paymentStatus ?? 'pending');
    setLoading(false);
  }, [router]);

  const draft = useMemo(() => getPendingCheckout(), [paymentMethod, paymentStatus]);
  const canContinue = paymentMethod === 'efectivo' || paymentStatus === 'verified';

  const persistPayment = (method: PaymentMethod, status: PaymentStatus) => {
    setPaymentMethod(method);
    setPaymentStatus(status);
    updatePendingCheckout((prev) => ({ ...prev, paymentMethod: method, paymentStatus: status }));
  };

  const handleCreateOrder = async () => {
    if (!draft) return;
    if (!canContinue) {
      setError('Primero marca el pago como verificado.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...draft.orderPayload, metodo_pago: paymentMethod } as any;
      const created = await createOrderService(payload);

      if (draft.cartItems?.length) {
        const deletePromises = draft.cartItems.map((item: any) =>
          deleteCartItemService(draft.cartId, item.id_producto)
        );
        await Promise.all(deletePromises);
      }
      window.dispatchEvent(new Event("cartUpdated"));

      saveConfirmationState({
        orderId: created.id_pedido,
        total: created.total,
        paymentMethod,
        paymentStatus: paymentMethod === 'efectivo' ? 'pending' : 'verified',
        canInvoice: paymentMethod !== 'efectivo',
        userEmail: draft.user?.email,
        summary: draft.summary,
        deliveryMethod: draft.orderPayload.tipo_entrega,
      });
      clearPendingCheckout();

      if (paymentMethod !== 'efectivo') {
        try {
          await sendInvoiceEmailService(created.id_pedido, draft.user?.email);
        } catch (emailError) {
          console.error('No se pudo enviar la factura', emailError);
        }
      }

      router.push('/confirmacion');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No pudimos confirmar el pedido';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Cargando pago...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/checkout" className="flex items-center gap-1 text-[#F40009] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Volver al checkout
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">Realizar pago</span>
          </div>
          <div className="text-xs text-gray-500">Flujo controlado sin pasarela real</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">Selecciona método de pago</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => persistPayment('qr', 'pending')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all
                    ${paymentMethod === 'qr' ? 'border-[#F40009] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <QrCode className="w-5 h-5 text-[#F40009]" />
                  <span className="font-semibold">QR</span>
                </button>
                <button
                  onClick={() => persistPayment('tarjeta', 'pending')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all
                    ${paymentMethod === 'tarjeta' ? 'border-[#F40009] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <CreditCard className="w-5 h-5 text-[#F40009]" />
                  <span className="font-semibold">Tarjeta</span>
                </button>
                <button
                  onClick={() => persistPayment('efectivo', 'pending')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all
                    ${paymentMethod === 'efectivo' ? 'border-[#F40009] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <Wallet className="w-5 h-5 text-[#F40009]" />
                  <span className="font-semibold">Efectivo</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'qr' && (
              <QrPaymentMock
                verified={paymentStatus === 'verified'}
                onVerify={() => persistPayment('qr', 'verified')}
              />
            )}

            {paymentMethod === 'tarjeta' && (
              <CardPaymentMock
                verified={paymentStatus === 'verified'}
                onVerify={() => persistPayment('tarjeta', 'verified')}
              />
            )}

            {paymentMethod === 'efectivo' && <CashPaymentInfo />}

            {paymentMethod !== 'efectivo' && (
              <div className={`flex items-center gap-2 text-sm ${paymentStatus === 'verified' ? 'text-green-700' : 'text-amber-700'} bg-amber-50 border border-amber-200 rounded-xl p-3`}>
                <CheckCircle className={`w-4 h-4 ${paymentStatus === 'verified' ? 'text-green-600' : 'text-amber-600'}`} />
                {paymentStatus === 'verified'
                  ? 'Pago verificado. Puedes continuar al resumen.'
                  : 'Marca el pago como verificado para continuar.'}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border rounded-2xl p-5 shadow-lg shadow-red-50 space-y-4">
              <h3 className="font-bold text-lg text-gray-800">Resumen del pedido</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">Bs. {draft.summary.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span className="font-semibold">Bs. {draft.summary.shipping.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-[#F40009]"><span>Total</span><span>Bs. {draft.summary.total.toFixed(2)}</span></div>
              </div>
              <div className="text-xs text-gray-500">
                La factura solo se emitirá si eliges QR o Tarjeta.
              </div>
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" /> {error}
                </div>
              )}
              <button
                onClick={handleCreateOrder}
                disabled={submitting || !canContinue}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${canContinue ? 'bg-[#F40009] text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500'}
                  ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Procesando...' : 'Continuar a la confirmación'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                No se almacenan datos sensibles. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}