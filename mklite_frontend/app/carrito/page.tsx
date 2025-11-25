// mklite_frontend/app/carrito/page.tsx

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';

// MOCK DATA para el carrito
const mockCartItems = [
  {
    id: 1,
    name: "Nuggets Dino Sofia 1 kg",
    image: "/images/nuggets.jpg", // Asegúrate de tener estas imágenes
    price: 64.80,
    oldPrice: 72.00,
    quantity: 2,
  },
  {
    id: 2,
    name: "Papa Holandesa 1 kg",
    image: "/images/papa.jpg", // Asegúrate de tener estas imágenes
    price: 13.00,
    oldPrice: 15.00,
    quantity: 5,
  },
];

const SHIPPING_COST = 5.00;

export default function CartPage() {
  // Lógica para calcular subtotales y total
  const subtotal = mockCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = subtotal + SHIPPING_COST;

  // Componente para un solo ítem del carrito
  const CartItem = ({ item }: { item: typeof mockCartItems[0] }) => {
    const itemSubtotal = (item.price * item.quantity).toFixed(2);
    
    return (
      <div className="flex items-center py-6 border-b border-gray-200">
        
        {/* Producto (Imagen + Nombre) */}
        <div className="w-2/5 flex items-center space-x-4">
          <Image 
            src={item.image} 
            alt={item.name} 
            width={70} 
            height={70} 
            style={{ objectFit: 'contain' }}
            className="rounded-md"
          />
          <span className="text-gray-800 font-medium">{item.name}</span>
        </div>

        {/* Precio Unitario */}
        <div className="w-1/5 text-center text-gray-800 font-semibold">
          Bs. {item.price.toFixed(2)}
          <p className="text-xs text-gray-500 line-through">Bs. {item.oldPrice.toFixed(2)}</p>
        </div>

        {/* Cantidad */}
        <div className="w-1/5 flex justify-center">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button className="p-2 hover:bg-gray-100 rounded-l-md text-gray-600"><Minus size={16} /></button>
            <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>
            <button className="p-2 hover:bg-gray-100 rounded-r-md text-gray-600"><Plus size={16} /></button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="w-1/5 text-right flex justify-end items-center space-x-4">
          <span className="text-gray-800 font-bold">Bs. {itemSubtotal}</span>
          <button className="text-gray-400 hover:text-red-500 transition">
            <X size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 py-10">
        
      {/* ➡ BANNER / BREADCRUMBS (Similar al de la ficha de producto) */}
      <div className="bg-gray-100 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 text-sm text-gray-500">
            {/* Usamos el Breadcrumb simple que se ve en el diseño */}
            <span className="font-semibold text-gray-800">Inicio</span>
            <span>/</span>
            <span className="font-semibold text-gray-800">Carrito</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Mi Carrito</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Lista de Productos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            
            {/* Encabezados de la Tabla */}
            <div className="flex text-sm font-semibold text-gray-500 border-b pb-2">
              <div className="w-2/5">PRODUCTO</div>
              <div className="w-1/5 text-center">PRECIO</div>
              <div className="w-1/5 text-center">CANTIDAD</div>
              <div className="w-1/5 text-right">SUBTOTAL</div>
            </div>

            {/* Ítems del Carrito */}
            <div>
              {mockCartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Botones Inferiores */}
            <div className="flex justify-between items-center pt-6">
             

              <Link href="/" passHref>
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150">
                        Seguir Comprando
                    </button>
                </Link>
              <button className="text-red-600 hover:text-red-800 font-semibold py-3 transition duration-150">
                Vaciar Carrito
              </button>
            </div>
          </div>

          {/* Columna Derecha: Resumen del Pedido */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen de Pedido</h2>
            
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

            {/* Botón Ir a Pagar (Rojo Coca-Cola) */}
          

            <Link href="/checkout" passHref> 
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 mt-6 rounded-md shadow-lg transition duration-150">
              Ir a Pagar
            </button>
          </Link>
          </div>

        </div>
      </div>
    </div>
  );
}