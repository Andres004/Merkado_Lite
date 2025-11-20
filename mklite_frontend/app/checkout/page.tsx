// mklite_frontend/app/checkout/page.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// MOCK DATA
const mockCartItems = [
  { id: 1, name: "Nuggets Dino Sofia 1 kg", price: 64.80, quantity: 1, image: "/images/nuggets.jpg" },
  { id: 2, name: "Papa Holandesa 1 kg", price: 13.00, quantity: 5, image: "/images/papa.jpg" },
];
const SHIPPING_COST = 5.00;

const subtotal = mockCartItems.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);
const total = subtotal + SHIPPING_COST;

// Componente: Resumen del Pedido (Columna Derecha)
const OrderSummary = () => (
  <div className="bg-white p-6 rounded-lg shadow-md h-fit border border-gray-200">
    <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>
    
    {/* Lista de Productos */}
    <div className="space-y-4 border-b pb-4 mb-4">
      {mockCartItems.map(item => (
        <div key={item.id} className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image 
              src={item.image} 
              alt={item.name} 
              width={40} 
              height={40} 
              style={{ objectFit: 'contain' }}
              className="rounded-md"
            />
            <span className="text-sm text-gray-700">{item.name} x{item.quantity}</span>
          </div>
          <span className="font-semibold text-gray-800">Bs. {(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
    </div>

    {/* Totales */}
    <div className="space-y-4 text-gray-700 border-b pb-4">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Costo de envío:</span>
        <span className="font-semibold">Bs. {SHIPPING_COST.toFixed(2)}</span>
      </div>
    </div>
    
    <div className="flex justify-between text-lg font-bold text-gray-800 pt-4">
      <span>Total:</span>
      <span>Bs. {total.toFixed(2)}</span>
    </div>

    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-4">Método de Pago</h3>
    <p className="text-sm text-gray-600 mb-6">Pago en efectivo al recibir tu pedido.</p> {/* MOCK de método de pago */}

    {/* Botón de Confirmar Pedido (Rojo Coca-Cola) */}
   

        <Link href="/confirmacion" passHref>
        <button
            type="submit" // Mantener type="submit" si está dentro de un <form> simulado
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-6 rounded-md shadow-lg transition duration-150"
        >
            Confirmar Pedido
        </button>
    </Link>
  </div>
);

// Componente: Información de Contacto y Entrega (Columna Izquierda)
const ContactAndDeliveryForm = () => (
    <form className="bg-white p-6 rounded-lg shadow-md space-y-8">
        {/* Enlace para Iniciar Sesión */}
       

        <div className="text-sm text-gray-600">
            ¿Ya tienes cuenta? <Link href="/user?tab=login" className="text-red-600 font-semibold hover:text-red-700">Iniciar Sesión</Link>
        </div>

        {/* 1. Información del Contacto */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre" className="p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                <input type="text" placeholder="Apellido" className="p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                <input type="email" placeholder="Correo Electrónico" className="p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                <input type="tel" placeholder="Teléfono" className="p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
            </div>
        </div>

        {/* 2. Dirección de Entrega */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dirección de Entrega</h2>
            <input type="text" placeholder="Calle, Número, Zona/Barrio" className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
            <textarea 
                placeholder="Ej: Casa con rejas verdes" 
                className="w-full p-3 border border-gray-300 rounded-md mt-4 focus:ring-red-500 focus:border-red-500"
                rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">Indicaciones Adicionales (Opcional)</p>
        </div>
        
        {/* 3. Método de Entrega */}
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Método de Entrega</h2>
            <div className="space-y-3">
                {/* Opción 1: Envío a Domicilio */}
                <label className="flex items-center space-x-2">
                    <input type="radio" name="deliveryMethod" defaultChecked />
                    <span className="font-medium text-gray-800">Envío a Domicilio</span>
                </label>
                
                {/* Opción 2: Recoger en Tienda */}
                <label className="flex items-start space-x-2 pt-2">
                    <input type="radio" name="deliveryMethod" className="mt-1" />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">Recoger en Tienda</span>
                        <p className="text-xs text-red-600 font-semibold mt-1">¡Tu pedido se reservará por 1 hora!</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Te enviaremos un correo de confirmación tan pronto como tu pedido esté listo para ser recogido.
                            Si el pedido no se recoge en 1 hora, la reserva será anulada.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">Puedes recogerlo en: Av. xxxxxxxxx</p>
                    </div>
                </label>
            </div>
        </div>

    </form>
);


export default function CheckoutPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
        
        {/* Breadcrumb (Similar al que se ve en el diseño) */}
        <div className="bg-gray-100 py-3 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">Inicio</span>
                <span>/</span>
                <span className="font-semibold text-gray-800">Carrito</span>
                <span>/</span>
                <span className="font-semibold text-red-600">Finalizar Compra</span>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Finalizar Compra</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Formulario (2/3 del ancho) */}
                <div className="lg:col-span-2">
                    <ContactAndDeliveryForm />
                </div>

                {/* Columna Derecha: Resumen (1/3 del ancho) */}
                <div className="lg:col-span-1">
                    <OrderSummary />
                </div>
            </div>
        </div>
    </div>
  );
}