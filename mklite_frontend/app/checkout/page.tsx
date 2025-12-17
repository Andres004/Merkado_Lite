'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
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
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-800">Cargando checkout...</div>;
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <Link href="/" className="text-red-600 hover:underline">Volver a la tienda</Link>
        </div>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans pb-20">
      
      {/* Navbar Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600 flex items-center">
          <Link href="/" className="hover:text-black transition">Inicio</Link> 
          <span className="mx-2">/</span>
          <Link href="/carrito" className="hover:text-black transition"> Carrito</Link> 
          <span className="mx-2">/</span>
          <span className="text-red-600 font-bold">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIOS === */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Datos Personales */}
          {/* CAMBIO: Borde Rojo y Título Rojo */}
          <section className="bg-white p-6 rounded-lg border border-red-600 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-6 border-b border-gray-200 pb-2">
              Información de Contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Cliente</label>
                  <input
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none cursor-not-allowed font-medium"
                    defaultValue={`${user?.nombre} ${user?.apellido}`}
                    readOnly
                  />
              </div>
              <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Email</label>
                  <input
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none cursor-not-allowed font-medium"
                    defaultValue={user?.email}
                    readOnly
                  />
              </div>
            </div>
          </section>

          {/* 2. Método de Entrega */}
          {/* CAMBIO: Borde Rojo y Título Rojo */}
          <section className="bg-white p-6 rounded-lg border border-red-600 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-6 border-b border-gray-200 pb-2">
              Método de Entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label 
                className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all duration-200 
                ${deliveryMethod === 'domicilio' ? 'border-gray-900 bg-gray-50 ring-1 ring-black' : 'border-gray-300 bg-white hover:border-gray-500'}`}
              >
                <input 
                    type="radio" 
                    name="delivery" 
                    checked={deliveryMethod === 'domicilio'} 
                    onChange={() => setDeliveryMethod('domicilio')}
                    className="accent-red-600 w-5 h-5"
                />
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Envío a Domicilio</span>
                    <span className="text-xs text-gray-500">Recíbelo en tu puerta (+Bs. {SHIPPING_COST.toFixed(2)})</span>
                </div>
              </label>

              <label 
                className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all duration-200 
                ${deliveryMethod === 'tienda' ? 'border-gray-900 bg-gray-50 ring-1 ring-black' : 'border-gray-300 bg-white hover:border-gray-500'}`}
              >
                <input 
                    type="radio" 
                    name="delivery" 
                    checked={deliveryMethod === 'tienda'} 
                    onChange={() => setDeliveryMethod('tienda')}
                    className="accent-red-600 w-5 h-5"
                />
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Recoger en Tienda</span>
                    <span className="text-xs text-gray-500">Gratis en sucursal central</span>
                </div>
              </label>
            </div>

            {/* Dirección */}
            {deliveryMethod === 'domicilio' && (
                <div className="animate-fadeIn">
                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Dirección de Entrega</label>
                    <input
                        className="w-full bg-white border border-gray-400 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        placeholder="Ej: Av. Heroínas #123, Edificio Azul..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <div className="mt-4">
                        <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Teléfono de referencia</label>
                        <input
                            className="w-full bg-white border border-gray-400 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                            placeholder="Celular para contacto"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
            )}
          </section>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN === */}
        <aside className="lg:col-span-1">
            {/* CAMBIO: Borde Rojo */}
            <div className="bg-white border border-red-600 rounded-lg p-6 shadow-sm sticky top-24">
                {/* CAMBIO: Título Rojo */}
                <h3 className="font-bold text-red-600 text-lg mb-6 border-b border-gray-200 pb-2">
                    Resumen del Pedido
                </h3>

                {/* Lista de productos */}
                <div className="space-y-4 border-b border-gray-200 pb-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart?.cartItems?.map((item: any) => (
                    <div
                        key={item.id_producto}
                        className="flex justify-between items-start text-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                                <Image
                                    src={item.product?.imagen_url || '/images/placeholder.jpg'}
                                    alt={item.product?.nombre}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-medium line-clamp-2 w-32">{item.product?.nombre}</span>
                                <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                            </div>
                        </div>
                        <span className="text-gray-900 font-bold whitespace-nowrap">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                    </div>
                    ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 text-sm border-b border-gray-200 pb-4 text-gray-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Costo de Envío</span>
                        <span>Bs. {shipping.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between font-bold text-xl text-gray-900 py-4">
                    <span>Total</span>
                    <span className="text-red-600">Bs. {total.toFixed(2)}</span>
                </div>

                {/* Info Pago */}
                <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                    <h4 className="font-bold text-xs text-gray-700 mb-1 uppercase">Método de Pago</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        💵 Pago en efectivo contra entrega
                    </p>
                </div>

                <button 
                    onClick={handleConfirmOrder}
                    disabled={processing}
                    className={`w-full text-white py-4 rounded-md font-bold text-lg shadow-md transition-all duration-200 transform active:scale-[0.98]
                    ${processing 
                        ? 'bg-gray-400 cursor-wait' 
                        : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'}`}
                >
                    {processing ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
            </div>
        </aside>
      </div>
    </div>
  );
}