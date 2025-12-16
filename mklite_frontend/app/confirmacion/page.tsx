"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get("order_id") || "---";
  const totalParam = searchParams.get("total");
  const total = totalParam ? parseFloat(totalParam) : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Banner superior */}
      <div className="h-23 md:h-32 w-full overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src="/images/bebe/crema.jpg"
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-9 relative z-10">
        <div className="text-xs md:text-sm text-gray-200">
          <span className="opacity-80">Inicio</span>{" "}
          <span className="opacity-80">/</span>{" "}
          <span className="opacity-80">Carrito</span>{" "}
          <span className="opacity-80">/</span>{" "}
          <span className="font-semibold text-white">Confirmación Pedido</span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center pt-16 md:pt-20 pb-24">
          
          {/* 👇 CAMBIO: Color forzado con estilo en línea */}
          <h1 
            className="text-2xl md:text-3xl font-semibold"
            style={{ color: '#333333' }}
          >
            ¡Gracias por tu Pedido!
          </h1>

          {/* Check verde */}
          <div className="flex justify-center mt-8 mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-20 h-20 md:w-24 md:h-24"
                fill="none"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#22c55e"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Texto Dinámico */}
          <p className="text-sm md:text-base text-gray-700">
            Tu pedido{" "}
            <span className="font-semibold text-black">
              #{orderId}
            </span>{" "}
            ha sido recibido correctamente.
          </p>

          <p className="text-sm md:text-base text-gray-600 mt-4">
            Por favor, ten listo el monto de{" "}
            <span className="font-semibold text-red-600 text-lg">
              Bs. {total.toFixed(2)}
            </span>{" "}
            en efectivo para el repartidor.
          </p>

          {/* Botón de retorno */}
          <div className="mt-10">
            <Link href="/">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-3 rounded-full transition shadow-lg transform active:scale-95">
                Volver al Inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}