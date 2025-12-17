'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
// AGREGADO: Importar 'Home'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ChevronRight, PackageOpen, Home } from 'lucide-react';
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

  // --- EMPTY STATE ---
  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            
            {/* CÍRCULO DEL ICONO CON SIGNO DE INTERROGACIÓN */}
            <div className="relative mb-8">
                <div className="w-48 h-48 bg-red-50/50 rounded-full flex items-center justify-center border-4 border-red-100 shadow-xl">
                    <ShoppingCart size={80} className="text-red-300 opacity-90" strokeWidth={1.5} />
                </div>
                <div className="absolute top-0 right-4 bg-white border-4 border-[#F40009] text-[#F40009] w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-3xl shadow-lg animate-bounce">
                    ?
                </div>
            </div>
            
            {/* TÍTULO ROJO FORZADO */}
            <h1 
                className="text-4xl md:text-5xl font-extrabold !text-[#F40009] mb-4 tracking-tight text-center"
                style={{ color: '#F40009' }}
            >
                Tu carrito está vacío
            </h1>
            
            <p className="text-gray-500 mb-10 text-center max-w-md text-lg">
                ¿No sabes qué comprar? ¡Tenemos miles de productos frescos esperándote!
            </p>
            
            <Link href="/categorias" className="bg-[#F40009] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-red-700 hover:shadow-xl transition-all transform hover:-translate-y-1 shadow-red-200 flex items-center gap-2">
                <ArrowLeft size={20} /> Ir a la tienda
            </Link>
        </div>
    );
  }

  const subtotal = cart.totalEstimado || 0;
  const total = subtotal; 

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm text-gray-500">
            {/* CAMBIO: Agregado flex items-center e icono Home */}
            <Link href="/" className="hover:text-[#F40009] transition-colors font-medium flex items-center">
                <Home size={16} className="mr-1" /> Inicio
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-300" />
            <span className="font-bold text-[#F40009]">Carrito</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        {/* --- TÍTULO PRINCIPAL ROJO --- */}
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 rounded-xl">
                <ShoppingCart className="text-[#F40009]" size={28} />
            </div>
            <h1 
                className="text-3xl font-extrabold !text-[#F40009] tracking-tight"
                style={{ color: '#F40009' }}
            >
                Resumen de Compra
            </h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
          <div className="lg:w-2/3 space-y-5">
             <div className="hidden md:flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-6">
                <span className="w-1/2">Detalle del Producto</span>
                <span className="w-1/6 text-center">Cantidad</span>
                <span className="w-1/6 text-right">Total</span>
             </div>

            {cart.cartItems.map((item: any) => (
                <div 
                    key={item.id_producto} 
                    className="group bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
                >
                    {/* Decoración hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F40009] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Imagen con Marco */}
                    <Link href={`/producto/${item.id_producto}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-red-50 transition-colors">
                        <Image 
                            src={item.product?.imagen_url || '/images/placeholder.jpg'} 
                            alt={item.product?.nombre || 'Producto'} 
                            fill
                            style={{ objectFit: 'contain' }}
                            className="group-hover:scale-110 transition-transform duration-500 p-2 mix-blend-multiply"
                        />
                    </Link>

                    {/* Info Producto */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <Link href={`/producto/${item.id_producto}`} className="block">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#F40009] transition-colors line-clamp-1">
                                {item.product?.nombre}
                            </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1 font-medium">
                            Unitario: <span className="text-gray-600">Bs. {Number(item.precio_unitario).toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#F40009] hover:bg-white rounded-l-xl transition-all active:scale-90"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900 text-sm select-none bg-transparent">
                            {item.cantidad}
                        </span>
                        <button 
                            onClick={() => handleQuantity(item.id_producto, item.cantidad + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#F40009] hover:bg-white rounded-r-xl transition-all active:scale-90"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Subtotal y Borrar */}
                    <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto sm:items-end gap-4 sm:gap-2 pl-4">
                        <span className="font-extrabold text-lg text-gray-900">
                            Bs. {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}
                        </span>
                        
                        <button 
                            onClick={() => handleDelete(item.id_producto)}
                            className="flex items-center text-xs font-semibold text-gray-400 bg-white border border-transparent hover:border-red-100 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-all gap-2 group/btn"
                        >
                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                            <span className="sm:hidden text-red-500">Eliminar</span>
                        </button>
                    </div>
                </div>
            ))}

            <Link href="/categorias" className="inline-flex items-center text-gray-500 hover:text-[#F40009] font-medium mt-8 transition-colors group px-2">
                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Continuar comprando
            </Link>
          </div>

          {/* --- COLUMNA DERECHA: RESUMEN (Sticky) --- */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                    Resumen
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{cart.cartItems.length} items</span>
                </h2>
                
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal productos</span>
                        <span className="font-medium text-gray-900">Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Descuentos</span>
                        <span className="font-medium text-green-600">- Bs. 0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Envío estimado</span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Se calcula al pagar</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100 border-dashed">
                    <span className="text-gray-900 font-bold text-lg">Total</span>
                    <span className="text-[#F40009] font-extrabold text-4xl tracking-tight">
                        Bs. {total.toFixed(2)}
                    </span>
                </div>

                <Link href="/checkout" className="block w-full">
                    <button className="w-full bg-[#F40009] hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3">
                        Proceder al Pago <ChevronRight size={20} strokeWidth={3} />
                    </button>
                </Link>
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400 flex justify-center items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span> 
                        Compra segura y protegida
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}