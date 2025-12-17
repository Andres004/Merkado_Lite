'use client'; 

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation'; 
import { getCartByUserService } from '../services/cart.service';

const SHIPPING = 5.0;
// ✅ Puerto 3005
const API_URL = 'http://localhost:3005'; 

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<any>(null); 
  
  const [selectedAddress, setSelectedAddress] = useState<'casa' | 'oficina'>('casa');
  const [tipoTiempo, setTipoTiempo] = useState<'inmediato' | 'programado'>('inmediato'); 

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    metodoEntrega: 'domicilio', 
    fechaEntrega: '',
    horaEntrega: ''
  });

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setFormData(prev => ({
            ...prev,
            nombre: user.nombre || user.nombre_completo || '',
            email: user.email || '',
            metodoEntrega: 'domicilio'
          }));

          if (user.id_usuario) {
            const cartData = await getCartByUserService(user.id_usuario);
            if (cartData && cartData.cartItems) {
              setCartItems(cartData.cartItems);
            }
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchDatos();
  }, []);

  const subtotal = cartItems.reduce((acc, item) => {
    const precio = Number(item.precio_unitario) || 0;
    const cantidad = Number(item.cantidad) || 0;
    return acc + (precio * cantidad);
  }, 0);

  const total = subtotal + (formData.metodoEntrega === 'tienda' ? 0 : SHIPPING);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CONFIRMAR PEDIDO ---
  const handleConfirmarPedido = async () => {
    if (cartItems.length === 0) return alert("Tu carrito está vacío");
    
    if (!currentUser || !currentUser.id_usuario) {
        alert("Error: No se identifica al usuario. Por favor inicia sesión nuevamente.");
        return;
    }

    let token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token && localStorage.getItem('userData')) {
        try {
            const u = JSON.parse(localStorage.getItem('userData') || '{}');
            token = u.token || u.access_token;
        } catch (e) {}
    }

    try {
      setLoading(true);

      let direccionFinal = "";
      if (formData.metodoEntrega === 'domicilio') {
          direccionFinal = selectedAddress === 'casa' ? "Av. Siempre Viva 123 (Casa)" : "Av. Empresarial #500 (Oficina)";
      } else {
          direccionFinal = "RECOJO_EN_TIENDA";
      }

      const orderPayload = {
        id_usuario_cliente: Number(currentUser.id_usuario), 
        direccion_entrega: direccionFinal,
        tipo_entrega: formData.metodoEntrega, 
        subtotal_override: subtotal,
        total_override: total,
        items: cartItems.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario)
        }))
      };

      console.log("📤 Enviando al Backend:", orderPayload);

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // ✅ CORRECCIÓN AQUÍ: Quitamos "/checkout"
      // Si tu controlador es @Controller('order') y el método es @Post(), la ruta es solo "/order"
      const response = await fetch(`${API_URL}/order`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Error ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMsg = errorJson.message || errorJson.error || errorText;
        } catch (e) {
            errorMsg = errorText; 
        }
        
        console.error("❌ RESPUESTA BACKEND:", errorMsg);
        alert(`No se pudo crear el pedido: ${errorMsg}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      router.push(`/confirmation?order_id=${data.id_pedido || data.id || 'OK'}&total=${total}`);
      
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor (Puerto 3005). Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div className="min-h-screen flex justify-center items-center">Cargando...</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
          Inicio / Carrito / <span className="text-gray-900 font-semibold">Finalizar Compra</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === IZQUIERDA: FORMULARIO === */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información del contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-red-600" placeholder="Nombre cliente" />
              <input name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-red-600" placeholder="Correo electrónico" />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Método de Entrega</h2>
            <div className="space-y-6">
              
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input type="radio" name="metodoEntrega" value="domicilio" checked={formData.metodoEntrega === 'domicilio'} onChange={handleChange} className="accent-red-600 w-4 h-4" />
                  <span className={`text-base ${formData.metodoEntrega === 'domicilio' ? 'font-bold' : ''}`}>Envío a Domicilio</span>
                </label>

                {formData.metodoEntrega === 'domicilio' && (
                  <div className="ml-7 animate-fadeIn">
                     <p className="text-gray-500 text-sm mb-3">¿Dónde lo enviamos?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div onClick={() => setSelectedAddress('casa')} className={`cursor-pointer border rounded-md p-4 bg-white ${selectedAddress === 'casa' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}>
                          <div className="flex justify-between">
                             <span className={`font-semibold block ${selectedAddress === 'casa' ? 'text-red-600' : 'text-gray-800'}`}>Casa</span>
                             {selectedAddress === 'casa' && <span className="text-xs text-green-600 font-medium">Predeterminada</span>}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">Av. Siempre Viva 123</p>
                          <p className="text-gray-400 text-xs">Tel: 77777777</p>
                        </div>
                        <div onClick={() => setSelectedAddress('oficina')} className={`cursor-pointer border rounded-md p-4 bg-white ${selectedAddress === 'oficina' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}>
                          <span className={`font-semibold block ${selectedAddress === 'oficina' ? 'text-red-600' : 'text-gray-800'}`}>Oficina</span>
                          <p className="text-gray-500 text-sm mt-1">Av. Empresarial #500</p>
                          <p className="text-gray-400 text-xs">Tel: 66666676</p>
                        </div>
                    </div>
                    <button className="text-sm font-medium text-gray-500 border border-gray-300 rounded px-6 py-2 hover:bg-gray-50 transition">+ Añadir Nueva Dirección</button>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="metodoEntrega" value="tienda" checked={formData.metodoEntrega === 'tienda'} onChange={handleChange} className="accent-red-600 w-4 h-4" />
                  <span className={`text-base ${formData.metodoEntrega === 'tienda' ? 'font-bold' : ''}`}>Recoger en tienda</span>
                </label>

                {formData.metodoEntrega === 'tienda' && (
                  <div className="ml-7 mt-3 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700 animate-fadeIn">
                    <p className="font-bold text-blue-900 mb-1">¡Tu pedido se reservará por 1 hora!</p>
                    <p className="mb-2">Te enviaremos un correo de confirmación tan pronto como tu pedido esté listo para ser recogido.</p>
                    <div className="border-t border-blue-200 pt-2 mt-2">
                       <p className="font-semibold text-blue-800">Puedes recogerlo en:</p>
                       <p>Av. Heroínas esq. Ayacucho #123</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

           <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">¿Cuándo lo quieres?</h2>
            
            <div className="flex flex-col gap-4 mb-6">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipoTiempo" checked={tipoTiempo === 'inmediato'} onChange={() => setTipoTiempo('inmediato')} className="accent-red-600 w-4 h-4" />
                  <span className={tipoTiempo === 'inmediato' ? 'font-medium text-gray-900' : 'text-gray-600'}>Entregar lo antes posible</span>
               </label>
               
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipoTiempo" checked={tipoTiempo === 'programado'} onChange={() => setTipoTiempo('programado')} className="accent-red-600 w-4 h-4" />
                  <span className={tipoTiempo === 'programado' ? 'font-medium text-gray-900' : 'text-gray-600'}>Programar mi pedido</span>
               </label>
            </div>

            {tipoTiempo === 'programado' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                   <div className="relative">
                      <input name="fechaEntrega" type="date" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded text-gray-700 outline-none focus:border-red-500" placeholder="dd/mm/aaaa" />
                   </div>
                   
                   <div className="relative">
                      <select name="horaEntrega" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded bg-white text-gray-700 outline-none focus:border-red-500">
                          <option value="">Selecciona una franja horaria</option>
                          <option value="09:00-10:00">09:00 - 10:00</option>
                          <option value="10:00-11:00">10:00 - 11:00</option>
                          <option value="11:00-12:00">11:00 - 12:00</option>
                          <option value="14:00-15:00">14:00 - 15:00</option>
                          <option value="15:00-16:00">15:00 - 16:00</option>
                          <option value="16:00-17:00">16:00 - 17:00</option>
                          <option value="17:00-18:00">17:00 - 18:00</option>
                      </select>
                   </div>
                </div>
            )}
           </section>
        </div>

        {/* === DERECHA: RESUMEN === */}
        <aside className="h-fit bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>
          
          <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
             {cartItems.length === 0 ? (
                 <p className="text-gray-500 text-sm">Tu carrito está vacío.</p>
             ) : (
                cartItems.map((item, index) => (
                <div key={`${item.id_producto}-${index}`} className="flex justify-between items-start text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden shrink-0">
                            <Image src={item.product?.imagen_url || '/placeholder.jpg'} alt="img" fill className="object-cover" unoptimized />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 line-clamp-1 w-32">{item.product?.nombre}</p>
                            <p className="text-xs text-gray-500">x{item.cantidad}</p>
                        </div>
                    </div>
                    <span className="font-medium text-gray-700">Bs. {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                </div>
                ))
             )}
          </div>

          <div className="space-y-2 text-sm border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Bs. {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Costo de Envío</span>
              <span>{formData.metodoEntrega === 'tienda' ? 'Gratis' : `Bs. ${SHIPPING.toFixed(2)}`}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-gray-800">Bs. {total.toFixed(2)}</span>
          </div>
            
          <p className="text-xs text-gray-500 mb-4 font-medium">Método de Pago<br/><span className="font-normal">Pago en efectivo al recibir tu pedido.</span></p>

          <button 
            onClick={handleConfirmarPedido}
            disabled={loading || cartItems.length === 0}
            className={`w-full text-white py-3 rounded-md font-bold transition-colors shadow-sm
              ${(loading || cartItems.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </aside>

      </div>
    </div>
  );
}