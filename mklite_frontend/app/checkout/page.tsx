'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { MapPin, Phone, User, Mail, CreditCard, CheckCircle, ChevronRight, Store, Truck } from 'lucide-react';
import { getCartByUserService, deleteCartItemService } from '../services/cart.service';
import { createOrderService, CreateOrderPayload } from '../services/order.service';

const SHIPPING_COST = 5.00;

export default function CheckoutPage() {
  const router = useRouter();
  
  // Estados de datos
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Estados del formulario
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'tienda'>('domicilio');

  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setAddress(parsedUser.direccion || '');
        setPhone(parsedUser.telefono || '');

        try {
          const cartData = await getCartByUserService(parsedUser.id_usuario);
          setCart(cartData);
        } catch (error) {
          console.error("Error cargando carrito", error);
        } finally {
          setLoading(false);
        }
      } else {
        alert("Por favor inicia sesión para continuar.");
        router.push('/');
      }
    };
    loadData();
  }, [router]);

  const handleConfirmOrder = async () => {
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) return;
    
    if (deliveryMethod === 'domicilio' && !address.trim()) {
        alert("Por favor ingresa una dirección de entrega.");
        return;
    }

    setProcessing(true);

    try {
      const orderData: CreateOrderPayload = {
        id_usuario_cliente: user.id_usuario,
        tipo_pedido: "online",
        metodo_pago: "efectivo",
        direccion_entrega: deliveryMethod === 'domicilio' ? address : 'Retiro en Tienda Central',
        tipo_entrega: deliveryMethod,
        items: cart.cartItems.map((item: any) => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: Number(item.precio_unitario)
        }))
      };

      await createOrderService(orderData);

      const deletePromises = cart.cartItems.map((item: any) => 
          deleteCartItemService(cart.id_carrito, item.id_producto)
      );
      await Promise.all(deletePromises);

      window.dispatchEvent(new Event("cartUpdated"));

      alert("¡Pedido realizado con éxito! Gracias por tu compra.");
      router.push('/'); 

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al procesar el pedido";
      alert("Ocurrió un error: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cart?.totalEstimado || 0;
  const shipping = deliveryMethod === 'domicilio' ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
             <div className="h-5 w-5 bg-[#F40009] rounded-full mb-4 animate-bounce"></div>
            <p className="text-gray-400 text-sm">Cargando checkout...</p>
        </div>
    );
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-[#F40009]">Tu carrito está vacío</h1>
            <Link href="/" className="text-gray-600 hover:text-[#F40009] underline transition-colors">Volver a la tienda</Link>
        </div>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans pb-20">
      
      {/* Navbar Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600 flex items-center">
          <Link href="/" className="hover:text-[#F40009] transition-colors">Inicio</Link> 
          <ChevronRight size={16} className="mx-2 text-gray-300" />
          <Link href="/carrito" className="hover:text-[#F40009] transition-colors"> Carrito</Link> 
          <ChevronRight size={16} className="mx-2 text-gray-300" />
          <span className="font-bold text-[#F40009]">Finalizar Compra</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIOS === */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Datos Personales */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F40009]"></div>
            <h2 className="text-xl font-extrabold !text-[#F40009] mb-6 flex items-center gap-2">
                <User size={24} /> Información de Contacto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider group-focus-within:text-[#F40009] transition-colors">Cliente</label>
                  <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 font-medium focus:outline-none focus:border-[#F40009] focus:bg-white transition-all cursor-not-allowed"
                        defaultValue={`${user?.nombre} ${user?.apellido}`}
                        readOnly
                      />
                  </div>
              </div>
              <div className="group">
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider group-focus-within:text-[#F40009] transition-colors">Email</label>
                  <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 font-medium focus:outline-none focus:border-[#F40009] focus:bg-white transition-all cursor-not-allowed"
                        defaultValue={user?.email}
                        readOnly
                      />
                  </div>
              </div>
            </div>
          </section>

          {/* 2. Método de Entrega */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F40009]"></div>
            <h2 className="text-xl font-extrabold !text-[#F40009] mb-6 flex items-center gap-2">
                <Truck size={24} /> Método de Entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Opción Domicilio */}
              <label 
                className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${deliveryMethod === 'domicilio' 
                    ? 'border-[#F40009] bg-red-50/30 shadow-md shadow-red-100/50' 
                    : 'border-gray-100 bg-white hover:border-gray-300'}`}
              >
                <div className="mt-1">
                    <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'domicilio'} 
                        onChange={() => setDeliveryMethod('domicilio')}
                        className="accent-[#F40009] w-5 h-5 cursor-pointer"
                    />
                </div>
                <div className="flex flex-col">
                    <span className={`font-bold text-lg ${deliveryMethod === 'domicilio' ? 'text-[#F40009]' : 'text-gray-700'}`}>
                        Envío a Domicilio
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Recíbelo en tu puerta (+Bs. {SHIPPING_COST.toFixed(2)})</span>
                </div>
                <Truck className={`absolute top-5 right-5 ${deliveryMethod === 'domicilio' ? 'text-[#F40009]' : 'text-gray-300'}`} size={24} />
              </label>

              {/* Opción Tienda */}
              <label 
                className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${deliveryMethod === 'tienda' 
                    ? 'border-[#F40009] bg-red-50/30 shadow-md shadow-red-100/50' 
                    : 'border-gray-100 bg-white hover:border-gray-300'}`}
              >
                <div className="mt-1">
                    <input 
                        type="radio" 
                        name="delivery" 
                        checked={deliveryMethod === 'tienda'} 
                        onChange={() => setDeliveryMethod('tienda')}
                        className="accent-[#F40009] w-5 h-5 cursor-pointer"
                    />
                </div>
                <div className="flex flex-col">
                    <span className={`font-bold text-lg ${deliveryMethod === 'tienda' ? 'text-[#F40009]' : 'text-gray-700'}`}>
                        Recoger en Tienda
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Gratis en sucursal central</span>
                </div>
                <Store className={`absolute top-5 right-5 ${deliveryMethod === 'tienda' ? 'text-[#F40009]' : 'text-gray-300'}`} size={24} />
              </label>
            </div>

            {/* Campos de Dirección */}
            {deliveryMethod === 'domicilio' && (
                <div className="animate-fade-in-up space-y-4 pt-4 border-t border-gray-100">
                    <div className="group">
                        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider group-focus-within:text-[#F40009] transition-colors">Dirección de Entrega</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F40009] transition-colors" />
                            <input
                                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F40009] focus:ring-1 focus:ring-[#F40009] transition-all"
                                placeholder="Ej: Av. Heroínas #123, Edificio Azul..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider group-focus-within:text-[#F40009] transition-colors">Teléfono de referencia</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F40009] transition-colors" />
                            <input
                                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F40009] focus:ring-1 focus:ring-[#F40009] transition-all"
                                placeholder="Celular para contacto"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
          </section>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN === */}
        <aside className="lg:col-span-1">
            {/* Título y Borde Rojo */}
            <div className="bg-white border-2 border-red-100 rounded-2xl p-6 shadow-lg shadow-red-50/50 sticky top-24">
                <h3 className="font-extrabold !text-[#F40009] text-xl mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                    Resumen del Pedido
                    <span className="bg-red-50 text-[#F40009] text-xs px-2 py-1 rounded-md font-normal">{cart?.cartItems.length} items</span>
                </h3>

                {/* Lista de productos (ESTILO BLOQUES con HOVER ROJO) */}
                <div className="space-y-3 border-b border-gray-100 pb-6 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart?.cartItems?.map((item: any) => (
                    <div
                        key={item.id_producto}
                        className="group flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-red-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                    >
                        {/* Imagen con marco */}
                        <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 group-hover:border-red-100">
                            <Image
                                src={item.product?.imagen_url || '/images/placeholder.jpg'}
                                alt={item.product?.nombre}
                                fill
                                style={{ objectFit: 'contain' }}
                                className="p-1 group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <span className="text-gray-900 font-bold text-sm line-clamp-1 group-hover:text-[#F40009] transition-colors">
                                {item.product?.nombre}
                            </span>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">x{item.cantidad}</span>
                                <span className="text-gray-900 font-bold text-sm">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Costo de Envío</span>
                        <span className={`font-medium ${deliveryMethod === 'domicilio' ? 'text-gray-900' : 'text-green-600'}`}>
                            {deliveryMethod === 'domicilio' ? `Bs. ${shipping.toFixed(2)}` : 'Gratis'}
                        </span>
                    </div>
                </div>

                {/* Total Final */}
                <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-4 mb-6">
                    <span className="text-gray-900 font-bold text-lg">Total a Pagar</span>
                    <span className="text-[#F40009] font-extrabold text-3xl">Bs. {total.toFixed(2)}</span>
                </div>

                {/* Info Pago */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full border border-gray-100 text-green-600">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-xs text-gray-900 uppercase">Método de Pago</h4>
                        <p className="text-xs text-gray-500">Pago en efectivo contra entrega</p>
                    </div>
                </div>

                <button 
                    onClick={handleConfirmOrder}
                    disabled={processing}
                    className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-2
                    ${processing 
                        ? 'bg-gray-400 cursor-wait' 
                        : 'bg-[#F40009] hover:bg-red-700 hover:shadow-red-200'}`}
                >
                    {processing ? (
                        'Procesando...'
                    ) : (
                        <>
                            Confirmar Pedido <CheckCircle size={20} />
                        </>
                    )}
                </button>
                
                <p className="text-[10px] text-gray-400 text-center mt-4">
                    Al confirmar, aceptas nuestros términos y condiciones.
                </p>
            </div>
        </aside>
      </div>
    </div>
  );
}