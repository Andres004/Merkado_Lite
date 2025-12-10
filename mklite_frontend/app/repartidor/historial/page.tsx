"use client";

import React from 'react';
import RepartidorSidebar from '../../components/RepartidorSidebar'; // Asegúrate de ajustar la ruta si es necesario
import { Search, ChevronDown } from 'lucide-react';

// MOCK DATA: Simula los datos del historial que vendrían del Backend
const historialMock = [
    { id: 3933, cliente: 'Juan Pérez', monto: 150.00, fecha: '18/11/2025 15:30', estado: 'Entregado' },
    { id: 5045, cliente: 'Mario Pérez', monto: 120.00, fecha: '17/11/2025 14:30', estado: 'Entregado' },
    { id: 5028, cliente: 'Pepe Pérez', monto: 90.00, fecha: '18/11/2025 17:30', estado: 'Entregado' },
    { id: 3934, cliente: 'Juan Pérez', monto: 150.00, fecha: '18/11/2025 15:30', estado: 'Entregado' },
    { id: 5046, cliente: 'Mario Pérez', monto: 120.00, fecha: '17/11/2025 14:30', estado: 'Entregado' },
    { id: 5030, cliente: 'Pepe Pérez', monto: 90.00, fecha: '18/11/2025 17:30', estado: 'Entregado' },
    { id: 3935, cliente: 'Juan Pérez', monto: 150.00, fecha: '18/11/2025 15:30', estado: 'Entregado' },
    { id: 5047, cliente: 'Mario Pérez', monto: 120.00, fecha: '17/11/2025 14:30', estado: 'Entregado' },
    { id: 5029, cliente: 'Pepe Pérez', monto: 90.00, fecha: '18/11/2025 17:30', estado: 'Entregado' },
];

// Componente para la etiqueta de estado
const EstadoBadge = ({ estado }: { estado: string }) => {
    const color = estado === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${color}`}>
            {estado}
        </span>
    );
};

export default function RepartidorHistorialPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="lg:w-64">
                        <RepartidorSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido del Historial */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Historial de Entregas Finalizadas</h1>

                        {/* Controles y Filtros */}
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            
                            {/* Filtro de Fecha */}
                            <div className="flex items-center space-x-4 w-full md:w-auto">
                                <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                                    Últimos 7 días
                                    <ChevronDown size={16} className="ml-2" />
                                </button>
                                
                                {/* Barra de Búsqueda */}
                                <div className="relative flex-grow">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID o Cliente"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs de Estado */}
                        <div className="flex space-x-2 mb-6 border-b border-gray-200">
                            <button className="bg-green-600 text-white font-semibold px-4 py-2 rounded-t-lg shadow-md transition-colors hover:bg-green-700">
                                Entregados Exitosamente
                            </button>
                            <button className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-t-lg transition-colors hover:bg-gray-100 border-x border-t border-gray-200">
                                Fallidos / No Entregados
                            </button>
                        </div>

                        {/* Tabla de Entregas */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID PEDIDO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MONTO COBRADO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA/HORA DE CIERRE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {historialMock.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                #{item.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.cliente}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                                Bs. {item.monto.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fecha}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EstadoBadge estado={item.estado} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a href={`/repartidor/detalle/${item.id}`} className="text-gray-500 hover:text-[#F40009] hover:underline">
                                                    Ver Detalle
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                    </main>
                </div>
            </div>
        </div>
    );
}