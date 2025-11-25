// mklite_frontend/app/confirmacion/page.tsx

import React from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';


// MOCK DATA
const MOCK_ORDER_ID = '1045';
const MOCK_TOTAL = 134.80;

export default function ConfirmationPage() {
  return (
    <div className="bg-gray-50 min-h-[80vh] pb-12">
        
        {/* Breadcrumb (Según el diseño: Carrito > Confirmación Pedido) */}
        <div className="bg-gray-100 py-3 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">Inicio</span>
                <span>/</span>
                <span className="font-semibold text-gray-800">Carrito</span>
                <span>/</span>
                <span className="font-semibold text-red-600">Confirmación Pedido</span>
            </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-20 text-center bg-white mt-12 rounded-lg shadow-xl">
            
            {/* Título y Checkmark */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">¡Gracias por tu Pedido!</h1>
            
            <div className="flex justify-center mb-6">
                {/* Usamos el ícono de verificación de lucide-react para simular la imagen */}
                <CheckCircle size={80} className="text-green-500" /> 
            </div>

            {/* Mensaje de Confirmación */}
            <div className="mb-10">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                    Tu pedido # <span className="text-red-600">[{MOCK_ORDER_ID}]</span> ha sido recibido.
                </p>
                <p className="text-gray-600">
                    Por favor, ten listo el monto de <span className="font-bold text-red-600">Bs. {MOCK_TOTAL.toFixed(2)}</span> en efectivo para el repartidor.
                </p>
            </div>

            {/* Sección de Guardar Datos/Crear Cuenta (Para usuarios no logueados) */}
            <div className="bg-gray-100 p-6 rounded-lg mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">¿Quieres guardar tus datos para la próxima?</h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Estás a un paso. Ya tenemos tus datos guardados de esta compra. Solo necesitas crear una contraseña para finalizar tu cuenta.
                </p>
                <a href="/user?tab=register" className="text-red-600 font-semibold hover:text-red-700 text-sm">
                    ¡Crear Cuenta y Guardar mi Pedido!
                </a>
            </div>

            {/* Botón Volver al Inicio */}
            <a href="/">
                <button 
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-12 rounded-md shadow-lg transition duration-150"
                >
                    Volver al Inicio
                </button>
            </a>
            
        </div>
    </div>
  );
}
