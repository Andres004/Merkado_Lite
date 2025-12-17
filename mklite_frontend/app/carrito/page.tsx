'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCartByUserService, updateCartItemService, deleteCartItemService } from '../services/cart.service';

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
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantity = async (id_producto: number, newQty: number) => {
    if (newQty < 1) return;
    if (!cart) return;

    try {
      await updateCartItemService(cart.id_carrito, id_producto, newQty);
      loadCart(); 
    } catch (error) {
      alert('Error al actualizar cantidad (posiblemente falta de stock)');
    }
  };

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

  // --- LOADING STATE ---
  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
             <div className="h-5 w-5 bg-[#F40009] rounded-full mb-4 animate-bounce"></div>
            <p className="text-gray-400 animate-pulse text-sm">Cargando tu carrito...</p>
        </div>
    );
  }

  // --- EMPTY STATE (DISEÑO MEJORADO v2) ---
  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            
            {/* Contenedor del Icono: Más grande y con bordes ROJOS */}
            <div className="relative bg-red-50 p-12 rounded-full mb-8 border-2 border-red-200 shadow-sm animate-fade-in-up">
                {/* Icono Carrito Grande */}
                <ShoppingCart size={120} className="text-red-300" strokeWidth={1} />
                
                {/* Signo de Interrogación Flotante en ROJO */}
                <span className="absolute top-6 right-10 text-7xl font-extrabold text-[#F40009] animate-bounce drop-shadow-sm font-sans">
                    ?
                </span>
            </div>
            
            {/* Título FORZADO A ROJO */}
            <h1 
                className="text-4xl md:text-5xl font-extrabold !text-[#F40009] mb-4 tracking-tight text-center"
                style={{ color: '#F40009' }}
            >
                Tu carrito está vacío
            </h1>
            
            <p className="text-gray-500 mb-10 text-center max-w-md text-lg">
                Parece que aún no has agregado nada. ¡Explora nuestro catálogo y encuentra los mejores productos frescos!
            </p>
            
            <Link href="/" className="bg-[#F40009] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-red-700 hover:shadow-lg transition-all transform hover:-translate-y-1 shadow-red-200">
                Empezar a comprar
            </Link>
        </div>
    );
  }

  const subtotal = cart.totalEstimado || 0;
  const total = subtotal; 

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-[#F40009] transition-colors font-medium">Inicio</Link>
            <ChevronRight size={16} className="mx-2 text-gray-300" />
            <span className="font-bold text-gray-900">Mi Carrito ({cart.cartItems.length})</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Resumen de Compra</h1>
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- LISTA DE PRODUCTOS --- */}
          <div className="lg:w-2/3 space-y-4">
             {/* Encabezados de tabla (Ocultos en móvil) */}
             <div className="hidden md:flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-6 pb-2">
                <span className="w-1/2">Producto</span>
                <span className="w-1/6 text-center">Cantidad</span>
                <span className="w-1/6 text-right">Precio</span>
             </div>

            {cart.cartItems.map((item: any) => (
                <div 
                    key={item.id_producto} 
                    className="group bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-100 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-6"
                >
                    {/* Imagen */}
                    <Link href={`/producto/${item.id_producto}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <Image 
                            src={item.product?.imagen_url || '/images/placeholder.jpg'} 
                            alt={item.product?.nombre || 'Producto'} 
                            fill
                            style={{ objectFit: 'contain' }}
                            className="group-hover:scale-105 transition-transform duration-500 p-2"
                        />
                    </Link>

                    {/* Info Producto */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <Link href={`/producto/${item.id_producto}`} className="block">
                            <h3 className="font-bold text-gray-900 text-lg hover:text-[#F40009] transition-colors line-clamp-1">
                                {item.product?.nombre}
                            </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                            Precio unitario: <span className="font-medium">Bs. {Number(item.precio_unitario).toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad - 1)}
                            className="p-2 text-gray-500 hover:text-[#F40009] hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{item.cantidad}</span>
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad + 1)}
                            className="p-2 text-gray-500 hover:text-[#F40009] hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Subtotal y Borrar */}
                    <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto sm:items-end gap-4 sm:gap-1">
                        <span className="font-bold text-lg text-gray-900">
                            Bs. {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}
                        </span>
                        
                        <button 
                            onClick={() => handleDelete(item.id_producto)}
                            className="flex items-center text-xs font-medium text-gray-400 hover:text-[#F40009] transition-colors gap-1 group/trash"
                        >
                            <Trash2 size={16} className="group-hover/trash:animate-bounce" />
                            <span className="sm:hidden">Eliminar</span>
                        </button>
                    </div>
                </div>
            ))}

            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#F40009] font-medium mt-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" />
                Seguir comprando
            </Link>
          </div>

          {/* --- RESUMEN (Sticky) --- */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío estimado</span>
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Se calcula en el pago</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-end mb-8">
                    <span className="text-gray-900 font-bold text-lg">Total estimado</span>
                    <span className="text-[#F40009] font-extrabold text-3xl">
                        Bs. {total.toFixed(2)}
                    </span>
                </div>

                <Link href="/checkout" className="block w-full">
                    <button className="w-full bg-[#F40009] hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2">
                        Ir a Pagar <ChevronRight size={20} />
                    </button>
                </Link>
                
                <p className="text-xs text-gray-400 text-center mt-4 flex justify-center items-center gap-2">
                    🔒 Pago 100% Seguro
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}