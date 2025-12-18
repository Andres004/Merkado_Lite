"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // Necesario para la navegación inferior
import RepartidorSidebar from '../components/RepartidorSidebar'; // Importar el Sidebar para desktop
import { MapPin, Store, DollarSign, Power, Home, Clock, User, CheckCircle } from 'lucide-react';


const pedidosMock = [
  {
    id: 12345,
    estado: "Listo para recoger",
    restaurante: "Pollos Copacabana - El Prado",
    direccion_entrega: "Av. Libertador #456, Edif. Torre Azul",
    ganancia: 15.00,
    distancia: "2.5 km"
  },
  {
    id: 12346,
    estado: "En preparación",
    restaurante: "Burger King - Cine Center",
    direccion_entrega: "Calle 21 de Calacoto #88",
    ganancia: 12.50,
    distancia: "1.8 km"
  },
  {
    id: 12347,
    estado: "Listo para recoger",
    restaurante: "Pizza Hut - San Miguel",
    direccion_entrega: "Av. Arce, Plaza Isabel la Católica",
    ganancia: 20.00,
    distancia: "4.2 km"
  }
];

export default function RepartidorPage() {
  const [isOnline, setIsOnline] = useState(false); 
  const [activeTab, setActiveTab] = useState('inicio'); 
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0"> {/* pb-20 solo para móvil */}
      
      {/* HEADER SUPERIOR */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto lg:max-w-full">
            <div className="max-w-md mx-auto w-full flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 font-medium">Bienvenido de nuevo,</p>
                    <h1 className="text-xl font-bold text-gray-800">Juan Pérez</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Switch En Línea / Desconectado */}
                    <div 
                        onClick={() => setIsOnline(!isOnline)}
                        className={`cursor-pointer flex items-center rounded-full p-1 w-24 transition-colors duration-300 ${isOnline ? 'bg-green-100 border border-green-200' : 'bg-gray-200'}`}
                    >
                        <div className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-16 bg-green-500' : 'translate-x-0 bg-gray-400'}`}></div>
                        <span className={`absolute text-xs font-bold ${isOnline ? 'ml-7 text-green-700' : 'ml-1.5 text-gray-500'}`}>
                            {isOnline ? 'En línea' : 'Offline'}
                        </span>
                    </div>

                    {/* Botón Salir */}
                    <button className="p-2 bg-red-50 rounded-full text-red-600 hover:bg-red-100 transition">
                        <Power size={20} />
                    </button>
                </div>
            </div>
        </div>
      </header>

      {/* ESTRUCTURA PRINCIPAL (SIDEBAR + CONTENIDO) */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Columna Izquierda: Menú de Navegación (Solo visible en Desktop) */}
            <aside className="hidden lg:block lg:w-64">
                <RepartidorSidebar />
            </aside>

            {/* Columna Derecha: Contenido de Pedidos Disponibles */}
            <main className="flex-1">
                
                {/* Contenedor que simula la pantalla de la App (max-w-md en móvil) */}
                <div className="max-w-md lg:max-w-full mx-auto"> 
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Pedidos Disponibles</h2>

                    {!isOnline ? (
                        // ESTADO OFF-LINE
                        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Power size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-gray-800 font-bold mb-2">Estás desconectado</h3>
                            <p className="text-gray-500 text-sm">Conéctate para empezar a recibir pedidos cercanos.</p>
                        </div>
                    ) : (
                        // LISTA DE PEDIDOS
                        <div className="space-y-4">
                            {pedidosMock.map((pedido) => (
                                <div key={pedido.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                    
                                    {/* Cabecera de la Tarjeta */}
                                    <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                                        <span className="font-bold text-gray-700">#{pedido.id}</span>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                            <CheckCircle size={12} className="mr-1" /> {pedido.estado}
                                        </span>
                                    </div>

                                    {/* Cuerpo de la Tarjeta */}
                                    <div className="p-4">
                                        
                                        {/* Ruta */}
                                        <div className="relative pl-4 border-l-2 border-gray-200 space-y-6 my-2">
                                            {/* Punto A (Restaurante) */}
                                            <div className="relative">
                                                <div className="absolute -left-[21px] bg-white border-2 border-blue-500 w-3 h-3 rounded-full"></div>
                                                <div className="flex items-start">
                                                    <Store size={18} className="text-blue-500 mr-2 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-semibold">RECOGER EN</p>
                                                        <p className="text-sm text-gray-800 font-medium">{pedido.restaurante}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Punto B (Cliente) */}
                                            <div className="relative">
                                                <div className="absolute -left-[21px] bg-white border-2 border-red-500 w-3 h-3 rounded-full"></div>
                                                <div className="flex items-start">
                                                    <MapPin size={18} className="text-red-500 mr-2 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-semibold">ENTREGAR EN</p>
                                                        <p className="text-sm text-gray-800 font-medium">{pedido.direccion_entrega}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Ganancia */}
                                        <div className="mt-6 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-green-700 font-bold text-lg">
                                                <DollarSign size={20} />
                                                <span>Bs. {pedido.ganancia.toFixed(2)}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{pedido.distancia} de recorrido</span>
                                        </div>

                                        {/* Botón Acción */}
                                        <button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg active:scale-95">
                                            Aceptar Pedido
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
      </div>


      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-20 lg:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto py-3">
            
            {/* Usamos Link para navegar a las páginas reales */}
            <Link href="/repartidor" legacyBehavior>
                <a 
                    onClick={() => setActiveTab('inicio')}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'inicio' ? 'text-[#F40009]' : 'text-gray-400'}`}
                >
                    <Home size={24} />
                    <span className="text-xs font-medium">Inicio</span>
                </a>
            </Link>

            <Link href="/repartidor/historial" legacyBehavior>
                <a 
                    onClick={() => setActiveTab('historial')}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'historial' ? 'text-[#F40009]' : 'text-gray-400'}`}
                >
                    <Clock size={24} />
                    <span className="text-xs font-medium">Historial</span>
                </a>
            </Link>

            <Link href="/repartidor/perfil" legacyBehavior>
                <a 
                    onClick={() => setActiveTab('perfil')}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'perfil' ? 'text-[#F40009]' : 'text-gray-400'}`}
                >
                    <User size={24} />
                    <span className="text-xs font-medium">Perfil</span>
                </a>
            </Link>

        </div>
      </div>

    </div>
  );
}