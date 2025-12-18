'use client';

import { CheckCircle, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

interface Props {
  onVerify: () => void;
  verified: boolean;
}

export default function QrPaymentMock({ onVerify, verified }: Props) {
  // Esto es lo que se “codifica” en el QR (puede ser lo que quieras)
  // Ideal: incluir pedido/total para que se vea realista.
  const qrValue = "";

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-[#F40009] font-bold">
        <QrCode className="w-5 h-5" /> Pago por QR
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* QR REAL (escaneable) */}
        <div className="bg-white p-4 rounded-2xl border shadow-inner">
          <QRCode
            value={qrValue}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
          />
        </div>

        <p className="text-sm text-gray-600 text-center">
          Escanea el código con tu banca móvil y luego confirma el pago.
        </p>

        <button
          onClick={onVerify}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all
            ${verified
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-[#F40009] text-white hover:bg-red-700 shadow-md shadow-red-200"
            }`}
        >
          {verified ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Pago verificado
            </>
          ) : (
            "He realizado el pago"
          )}
        </button>

        {/* (Opcional) mostrar el texto del QR para debug */}
        <p className="text-[11px] text-gray-400 break-all text-center max-w-xs">
          {qrValue}
        </p>
      </div>
    </div>
  );
}
