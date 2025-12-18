'use client';

import { useState } from "react";
import { CreditCard, Shield, CheckCircle2 } from "lucide-react";

interface Props {
  onVerify: () => void;
  verified: boolean;
}

export default function CardPaymentMock({ onVerify, verified }: Props) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify();
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-[#F40009] font-bold">
        <CreditCard className="w-5 h-5" /> Pago con tarjeta
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Nombre en la tarjeta</label>
            <input
              className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F40009]"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Nombre Apellido"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm text-gray-600">Número de tarjeta</label>
            <input
              className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F40009]"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Fecha</label>
            <input
              className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F40009]"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              placeholder="MM/AA"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">CVV</label>
            <input
              className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F40009]"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="***"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" /> Seguro
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
            ${verified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-[#F40009] text-white hover:bg-red-700'}`}
        >
          {verified ? <><CheckCircle2 className="w-4 h-4" /> Pago verificado</> : 'Pagar'}
        </button>
      </form>
    </div>
  );
}