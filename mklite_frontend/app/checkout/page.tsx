'use client'; 

import React, { useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation'; 

// --- DATOS DE PRUEBA (CARRITO) ---
const cartItems = [
  {
    id: 1, 
    name: "Nuggets Dino Sofia 1 kg",
    price: 64.8,
    image: "/images/nuggets.jpg",
    cantidad: 1 
  },
  {
    id: 2,
    name: "Papa Holandesa 1 kg",
    price: 65.0,
    image: "/images/papa.jpg",
    cantidad: 1
  },
];

const SHIPPING = 5.0;
const subtotal = cartItems.reduce((a, b) => a + b.price, 0);

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS DE UI ---
  const [selectedAddress, setSelectedAddress] = useState<'casa' | 'oficina'>('casa');
  const [tipoTiempo, setTipoTiempo] = useState<'inmediato' | 'programado'>('programado');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    metodoEntrega: 'delivery', 
    fechaEntrega: '',
    horaEntrega: ''
  });

  const costoEnvioReal = formData.metodoEntrega === 'tienda' ? 0 : SHIPPING;
  const total = subtotal + costoEnvioReal;

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- LÓGICA DE CONFIRMACIÓN (SIMULADA AQUÍ MISMO) ---
  const handleConfirmarPedido = async () => {
    try {
      setLoading(true);

      // 1. Preparamos los datos (igual que antes)
      let direccionFinal = "";
      if (formData.metodoEntrega === 'delivery') {
         direccionFinal = selectedAddress === 'casa' 
           ? "Av. Siempre Viva 123 (Casa)" 
           : "Av. Empresarial #500 (Oficina)";
      } else {
         direccionFinal = "RECOJO_EN_TIENDA";
      }

      let fechaProgramadaISO = new Date().toISOString();
      if (tipoTiempo === 'programado' && formData.fechaEntrega && formData.horaEntrega) {
        const horaInicio = formData.horaEntrega.split('-')[0]; 
        const fechaString = `${formData.fechaEntrega}T${horaInicio}:00`;
        fechaProgramadaISO = new Date(fechaString).toISOString();
      }

      // Solo para ver en consola qué enviaríamos al backend
      const payload = {
        cliente: formData.nombre,
        direccion: direccionFinal,
        total: total,
        items: cartItems
      };
      console.log("Enviando pedido (Simulado):", payload);

      // 2. SIMULACIÓN DE ESPERA (Como si conectara al backend)
      // Esperamos 1.5 segundos para parecer real
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Generamos un ID falso
      const fakeOrderId = "PED-" + Math.floor(Math.random() * 10000);

      // 4. Redirigimos a la página de éxito
      router.push(`/confirmation?order_id=${fakeOrderId}&total=${total}`);
      
    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
          Inicio / Carrito / <span className="text-gray-900 font-semibold">Finalizar Compra</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA - FORMULARIO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. INFORMACIÓN DE CONTACTO */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Información del contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="nombre"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="Nombre cliente"
              />
              <input
                name="email"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="Correo electrónico"
              />
            </div>
          </section>

          {/* 2. MÉTODO DE ENTREGA */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Método de Entrega
            </h2>
            
            <div className="space-y-4">
              
              {/* Opción A: ENVÍO A DOMICILIO */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2 group">
                  <input 
                    type="radio" 
                    name="metodoEntrega" 
                    value="delivery"
                    checked={formData.metodoEntrega === 'delivery'}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 accent-red-600"
                  />
                  <span className={`transition-all duration-200 
                    ${formData.metodoEntrega === 'delivery' ? 'text-gray-900 font-bold' : 'text-gray-500 font-normal group-hover:text-gray-700'}`}>
                    Envío a Domicilio
                  </span>
                </label>

                {formData.metodoEntrega === 'delivery' && (
                  <div className="ml-7 mt-2 mb-6 animate-fadeIn">
                    <p className="text-gray-500 text-sm mb-3">¿Dónde lo enviamos?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Casa */}
                      <div 
                        onClick={() => setSelectedAddress('casa')}
                        className={`cursor-pointer border rounded-md p-4 bg-white transition-all
                          ${selectedAddress === 'casa' 
                            ? 'border-red-500 ring-1 ring-red-500 shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-semibold ${selectedAddress === 'casa' ? 'text-red-600' : 'text-gray-700'}`}>Casa</span>
                          {selectedAddress === 'casa' && <span className="text-xs text-green-600 font-medium">Predeterminada</span>}
                        </div>
                        <p className="text-gray-600 text-sm">Av. Siempre Viva 123</p>
                        <p className="text-gray-600 text-sm">Tel: 77777777</p>
                      </div>
                      {/* Oficina */}
                      <div 
                        onClick={() => setSelectedAddress('oficina')}
                        className={`cursor-pointer border rounded-md p-4 bg-white transition-all
                          ${selectedAddress === 'oficina' 
                            ? 'border-red-500 ring-1 ring-red-500 shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-semibold ${selectedAddress === 'oficina' ? 'text-red-600' : 'text-gray-700'}`}>Oficina</span>
                        </div>
                        <p className="text-gray-600 text-sm">Av. Empresarial #500</p>
                        <p className="text-gray-600 text-sm">Tel: 66666676</p>
                      </div>
                    </div>
                    <button className="mt-4 border border-gray-400 text-gray-500 text-sm font-medium py-2 px-6 rounded hover:border-gray-600 hover:text-gray-700 transition-colors">
                      + Añadir Nueva Dirección
                    </button>
                  </div>
                )}
              </div>

              {/* Opción B: RECOGER EN TIENDA */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="metodoEntrega" 
                    value="tienda"
                    checked={formData.metodoEntrega === 'tienda'}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 accent-red-600"
                  />
                  <span className={`transition-all duration-200 
                      ${formData.metodoEntrega === 'tienda' ? 'text-gray-900 font-bold' : 'text-gray-500 font-normal group-hover:text-gray-700'}`}>
                    Recoger en tienda
                  </span>
                </label>

                {formData.metodoEntrega === 'tienda' && (
                  <div className="ml-7 mt-3 text-sm text-gray-600 space-y-2 animate-fadeIn bg-gray-50 p-4 rounded-md border border-gray-100">
                    <p className="font-bold text-gray-800">
                      ¡Tu pedido se reservará por 1 hora!
                    </p>
                    <p>
                      Te enviaremos un correo de confirmación tan pronto como tu pedido esté listo para ser recogido.
                    </p>
                    <p>
                      Si el pedido no se recoge en 1 hora, la reserva será anulada.
                    </p>
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <p className="font-semibold text-gray-800 mt-2">Puedes recogerlo en:</p>
                      <p className="text-gray-700">Av. Heroínas esq. Ayacucho #123</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* 3. TIEMPO DE ENTREGA */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 mt-6">
              ¿Cuándo lo quieres?
            </h2>
            <div className="space-y-3 mb-4">
               {/* Opción INMEDIATO */}
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="tipoTiempo" 
                    checked={tipoTiempo === 'inmediato'}
                    onChange={() => setTipoTiempo('inmediato')}
                    className="w-4 h-4 text-red-600 accent-red-600" 
                  />
                  <span className={`transition-all duration-200 text-sm
                    ${tipoTiempo === 'inmediato' ? 'text-gray-900 font-bold' : 'text-gray-500 font-normal group-hover:text-gray-700'}`}>
                    Entregar lo antes posible
                  </span>
               </label>
               {/* Opción PROGRAMADO */}
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="tipoTiempo" 
                    checked={tipoTiempo === 'programado'}
                    onChange={() => setTipoTiempo('programado')}
                    className="w-4 h-4 text-red-600 accent-red-600" 
                  />
                  <span className={`transition-all duration-200 text-sm
                    ${tipoTiempo === 'programado' ? 'text-gray-900 font-bold' : 'text-gray-500 font-normal group-hover:text-gray-700'}`}>
                    Programar mi pedido
                  </span>
               </label>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 
                ${tipoTiempo === 'inmediato' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <input
                name="fechaEntrega"
                type="date"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 text-sm"
              />
              <select 
                name="horaEntrega" 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 text-sm bg-white"
              >
                <option value="">Selecciona una franja horaria</option>
                <option value="09:00-11:00">09:00 - 11:00</option>
                <option value="15:00-17:00">15:00 - 17:00</option>
              </select>
            </div>
          </section>

        </div>

        {/* COLUMNA DERECHA - RESUMEN */}
        <aside className="h-fit bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen del Pedido</h3>
          <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative overflow-hidden rounded border border-gray-200 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="text-gray-500 font-normal leading-tight w-32">{item.name}</span>
                </div>
                <span className="text-gray-400 font-normal">Bs. {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-b border-gray-100 pb-4 mb-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>Bs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Costo de Envío</span>
              <span>
                {formData.metodoEntrega === 'tienda' ? 'Gratis' : `Bs. ${SHIPPING.toFixed(2)}`}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-base font-bold text-gray-500">Total</span>
            <span className="text-xl font-bold text-gray-400">Bs. {total.toFixed(2)}</span>
          </div>
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 text-sm mb-1">Método de Pago</h4>
            <p className="text-sm text-gray-500">
              Pago en efectivo al recibir tu pedido.
            </p>
          </div>
          <button 
            onClick={handleConfirmarPedido}
            disabled={loading}
            className={`w-full text-white py-3 rounded-full font-bold text-base transition-colors shadow-md
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </aside>

      </div>
    </div>
  );
}