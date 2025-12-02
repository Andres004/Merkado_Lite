'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { getCartByUserService, updateCartItemService, deleteCartItemService } from '../services/cart.service';

const SHIPPING_COST = 5.00;

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el carrito
  const loadCart = async () => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      try {
        const cartData = await getCartByUserService(user.id_usuario);
        setCart(cartData);
      } catch (error) {
        console.error("Error cargando carrito", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false); // No hay usuario
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Manejar incremento/decremento
  const handleQuantity = async (id_producto: number, newQty: number) => {
    if (newQty < 1) return;
    if (!cart) return;

    try {
      await updateCartItemService(cart.id_carrito, id_producto, newQty);
      loadCart(); // Recargar para ver precios actualizados
    } catch (error) {
      alert('Error al actualizar cantidad (posiblemente falta de stock)');
    }
  };

  // Manejar eliminación
  const handleDelete = async (id_producto: number) => {
    if (!cart) return;
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await deleteCartItemService(cart.id_carrito, id_producto);
      loadCart();
    } catch (error) {
      alert('Error al eliminar producto');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando carrito...</div>;
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Tu carrito está vacío</h1>
            <Link href="/" className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
                Ir a comprar
            </Link>
        </div>
    );
  }

  const subtotal = cart.totalEstimado || 0;
  const total = subtotal + SHIPPING_COST;

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
        
      {/* BREADCRUMBS */}
      <div className="bg-gray-100 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="font-semibold text-gray-800 hover:underline">Inicio</Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Carrito</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Mi Carrito</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            
            <div className="flex text-sm font-semibold text-gray-500 border-b pb-2">
              <div className="w-2/5">PRODUCTO</div>
              <div className="w-1/5 text-center">PRECIO</div>
              <div className="w-1/5 text-center">CANTIDAD</div>
              <div className="w-1/5 text-right">SUBTOTAL</div>
            </div>

            <div>
              {cart.cartItems.map((item: any) => (
                <div key={item.id_producto} className="flex items-center py-6 border-b border-gray-200">
                    
                    {/* Producto */}
                    <div className="w-2/5 flex items-center space-x-4">
                      <div className="relative w-[70px] h-[70px] flex-shrink-0">
                        <Image 
                            src={item.product?.imagen_url || '/images/placeholder.jpg'} 
                            alt={item.product?.nombre || 'Producto'} 
                            fill
                            style={{ objectFit: 'contain' }}
                            className="rounded-md"
                            unoptimized
                        />
                      </div>
                      <span className="text-gray-800 font-medium line-clamp-2">{item.product?.nombre}</span>
                    </div>

                    {/* Precio */}
                    <div className="w-1/5 text-center text-gray-800 font-semibold">
                      Bs. {Number(item.precio_unitario).toFixed(2)}
                    </div>

                    {/* Cantidad */}
                    <div className="w-1/5 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad - 1)}
                            className="p-2 hover:bg-gray-100 rounded-l-md text-gray-600"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-3 font-semibold text-gray-800">{item.cantidad}</span>
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad + 1)}
                            className="p-2 hover:bg-gray-100 rounded-r-md text-gray-600"
                        >
                            <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal Item */}
                    <div className="w-1/5 text-right flex justify-end items-center space-x-4">
                      <span className="text-gray-800 font-bold">
                        Bs. {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDelete(item.id_producto)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                </div>
              ))}
            </div>

            {/* Botones Inferiores */}
            <div className="flex justify-between items-center pt-6">
              <Link href="/">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150">
                        Seguir Comprando
                    </button>
                </Link>
            </div>
          </div>

          {/* RESUMEN DEL PEDIDO */}
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

            <Link href="/checkout">
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