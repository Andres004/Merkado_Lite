'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // IMPORTANTE: Para cargar el mapa sin errores de servidor

// Iconos de Lucide
import { 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  Store, 
  Truck, 
  Home, 
  Calculator, 
  AlertCircle 
} from 'lucide-react';

// Servicios (Asegúrate de que estas rutas sean correctas según tu estructura de carpetas)
//import { getCartByUserService, deleteCartItemService } from '../services/cart.service';
//import { createOrderService } from '../services/order.service';
import { getCartByUserService } from '../services/cart.service';
import { savePendingCheckout } from '../utils/checkoutStorage';

// --- IMPORTACIÓN DINÁMICA DEL MAPA ---
// Esto busca el archivo en src/components/MapSelector.tsx
// Si te da error aquí, verifica que la carpeta 'components' esté en 'src'
const MapSelector = dynamic(() => import('../components/MapSelector'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  )
});

// --- CONFIGURACIÓN ---
const STORE_LOCATION = { lat: -17.3713, lng: -66.1442 }; // UCB Cochabamba
const BASE_RATE = 5.00;
const RATE_PER_KM = 2.00;

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
  const [extraDetails, setExtraDetails] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'tienda'>('domicilio');

  // Estados de Geolocalización
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [shippingCost, setShippingCost] = useState(BASE_RATE);
  const [distance, setDistance] = useState(0);

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

  // --- LÓGICA DE CÁLCULO DE ENVÍO ---
  const handleLocationSelect = (lat: number, lng: number) => {
      setLocation({ lat, lng });
      
      // Fórmula de Haversine para calcular distancia
      const R = 6371; 
      const dLat = (lat - STORE_LOCATION.lat) * (Math.PI / 180);
      const dLng = (lng - STORE_LOCATION.lng) * (Math.PI / 180);
      const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(STORE_LOCATION.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = R * c;

      setDistance(distKm);

      // Calcular precio: Base + (Km extra * Tarifa)
      let cost = BASE_RATE;
      if (distKm > 1) {
          cost = BASE_RATE + ((distKm - 1) * RATE_PER_KM);
      }
      
      setShippingCost(Math.round(cost * 100) / 100);
  };

  const handleConfirmOrder = async () => {
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) return;
    
    // Validaciones
    if (deliveryMethod === 'domicilio') {
        if (!address.trim()) {
            alert("Por favor escribe una dirección de referencia.");
            return;
        }
        if (!location) {
            alert("Por favor marca tu ubicación exacta en el mapa.");
            return;
        }
    }

    setProcessing(true);

    try {
      // Construimos el objeto del pedido
      const orderData = {
        id_usuario_cliente: user.id_usuario,
        tipo_pedido: "online",
        metodo_pago: "efectivo",
        
        // Datos de Entrega
        tipo_entrega: deliveryMethod,
        direccion_entrega: deliveryMethod === 'domicilio' 
            ? `${address} ${extraDetails ? `(${extraDetails})` : ''}`
            : 'Retiro en Tienda Central (UCB)',
        
        // Coordenadas y Costo
        latitud_entrega: deliveryMethod === 'domicilio' ? location?.lat : null,
        longitud_entrega: deliveryMethod === 'domicilio' ? location?.lng : null,
        costo_envio: deliveryMethod === 'domicilio' ? shippingCost : 0,

        // Productos
        items: cart.cartItems.map((item: any) => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: Number(item.precio_unitario)
        }))
      };

            savePendingCheckout({
        orderPayload: orderData as any,
        cartId: cart.id_carrito,
        cartItems: cart.cartItems,
        summary: {
          subtotal,
          shipping: finalShipping,
          total,
        },
        user,
        paymentStatus: 'pending',
      });

      router.push('/pago');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al preparar el pedido";
      alert("Ocurrió un error: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  // Cálculos visuales
  const subtotal = cart?.totalEstimado || 0;
  const finalShipping = deliveryMethod === 'domicilio' ? shippingCost : 0; 
  const total = subtotal + finalShipping;

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
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans pb-20 animate-fade-in-up">
      
      {/* Navbar Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600 flex items-center">
          <Link href="/" className="hover:text-[#F40009] transition-colors flex items-center">
            <Home size={16} className="mr-1" /> Inicio
          </Link> 
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
            <h2 className="text-xl font-extrabold text-[#F40009] mb-6 flex items-center gap-2">
                <User size={24} /> Información de Contacto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 uppercase font-bold">Cliente</label>
                    <p className="font-medium text-gray-900">{user?.nombre} {user?.apellido}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
            </div>
          </section>

          {/* 2. Método de Entrega */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F40009]"></div>
            <h2 className="text-xl font-extrabold text-[#F40009] mb-6 flex items-center gap-2">
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
                    <span className="text-xs text-gray-500 mt-1">Calculado según distancia</span>
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
                    <span className="text-xs text-gray-500 mt-1">Gratis en UCB (Cochabamba)</span>
                </div>
                <Store className={`absolute top-5 right-5 ${deliveryMethod === 'tienda' ? 'text-[#F40009]' : 'text-gray-300'}`} size={24} />
              </label>
            </div>

            {/* CAMPOS DE DIRECCIÓN Y MAPA */}
            {deliveryMethod === 'domicilio' && (
                <div className="animate-fade-in space-y-6 pt-6 border-t border-gray-100">
                    
                    {/* MAPA */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                             <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                <MapPin size={16} className="text-[#F40009]" /> Ubicación Exacta
                            </label>
                            {location && (
                                <span className="text-xs font-bold text-[#F40009] bg-red-50 px-2 py-1 rounded border border-red-100">
                                    Distancia: {distance.toFixed(2)} km
                                </span>
                            )}
                        </div>
                        
                        <div className="rounded-xl overflow-hidden border border-gray-300 shadow-inner relative z-0 h-[320px]">
                             <MapSelector 
                                onLocationSelect={handleLocationSelect}
                                initialPos={location ? [location.lat, location.lng] : undefined}
                             />
                             {!location && (
                                 <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none flex items-center justify-center">
                                     <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow text-gray-600">
                                        Toca el mapa para fijar ubicación
                                     </span>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Inputs de Texto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Dirección Escrita *</label>
                            <input
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-[#F40009] focus:ring-1 focus:ring-[#F40009] outline-none"
                                placeholder="Ej: Calle, # de casa, color"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Celular *</label>
                            <input
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-[#F40009] focus:ring-1 focus:ring-[#F40009] outline-none"
                                placeholder="Para coordinar la entrega"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Detalles Extra (Opcional)</label>
                             <input
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-[#F40009] focus:ring-1 focus:ring-[#F40009] outline-none"
                                placeholder="Ej: Portón negro, timbre roto"
                                value={extraDetails}
                                onChange={(e) => setExtraDetails(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
          </section>
        </div>

        {/* === COLUMNA DERECHA: RESUMEN === */}
        <aside className="lg:col-span-1">
            <div className="bg-white border-2 border-red-100 rounded-2xl p-6 shadow-xl shadow-red-50/50 sticky top-24">
                <h3 className="font-extrabold text-[#F40009] text-xl mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                    Tu Pedido
                    <span className="bg-red-50 text-[#F40009] text-xs px-2 py-1 rounded-md font-bold">{cart?.cartItems.length} items</span>
                </h3>

                {/* Lista compacta */}
                <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart?.cartItems?.map((item: any) => (
                    <div key={item.id_producto} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-gray-50 rounded border border-gray-200 flex-shrink-0 relative overflow-hidden">
                             <Image 
                                src={item.product?.imagen_url || '/images/placeholder.jpg'} 
                                alt={item.product?.nombre || 'Producto'} 
                                fill 
                                className="object-contain" 
                             />
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-bold text-gray-800 line-clamp-1">{item.product?.nombre}</p>
                            <p className="text-gray-500 text-xs">x{item.cantidad}</p>
                        </div>
                        <p className="font-bold text-sm">Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</p>
                    </div>
                    ))}
                </div>

                {/* Desglose de Costos */}
                <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold text-gray-900">Bs. {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {deliveryMethod === 'domicilio' ? (
                        <div className="flex justify-between items-center text-[#F40009]">
                            <span className="flex items-center gap-1"> 
                                <Calculator size={14}/> Envío ({distance.toFixed(1)} km)
                            </span>
                            <span className="font-bold">Bs. {shippingCost.toFixed(2)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-green-600">
                             <span>Recogida en Tienda</span>
                             <span className="font-bold">GRATIS</span>
                        </div>
                    )}
                </div>

                {/* Total Final */}
                <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-900 font-bold text-lg">Total</span>
                    <span className="text-[#F40009] font-extrabold text-3xl">Bs. {total.toFixed(2)}</span>
                </div>

                {/* Botón Confirmar */}
                <button 
                    onClick={handleConfirmOrder}
                    disabled={processing}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2
                    ${processing 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#F40009] text-white hover:bg-red-700 hover:scale-[1.02] shadow-red-200'}`}
                >
                    {processing ? 'Confirmando...' : <>Confirmar Compra <CheckCircle size={20} /></>}
                </button>
                
                {!location && deliveryMethod === 'domicilio' && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                        <AlertCircle size={14} className="mt-0.5" />
                        Recuerda marcar tu ubicación en el mapa.
                    </div>
                )}
            </div>
        </aside>
      </div>
    </div>
  );
}