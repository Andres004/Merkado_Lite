"use client";

import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar'; // Asume que la ruta es correcta
import { Search, ChevronDown, CheckCircle, Clock, XCircle, Truck, ShoppingBag } from 'lucide-react';

// ----------------------------------------------------
// 1. DEFINICIÓN DE TIPOS Y MOCK DATA
// ----------------------------------------------------

// Tipo para el estado del pedido
type EstadoPedido = 'Procesando' | 'En Camino' | 'Entregado' | 'Cancelado' | 'Recoger Tienda';

// Tipo para el tipo de entrega
type TipoEntrega = 'Domicilio' | 'Recoger Tienda';

// Interfaz para un pedido individual
interface Pedido {
    id: string;
    cliente: string;
    total: number;
    numProductos: number;
    estado: EstadoPedido;
    tipoEntrega: TipoEntrega;
    fechaHora: string;
}

// Datos simulados (MOCK DATA)
const mockPedidos: Pedido[] = [
    { id: '#3933', cliente: 'Pepe xxxxxx', total: 105.00, numProductos: 5, estado: 'Procesando', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#5045', cliente: 'Pepe xxxxxx', total: 85.00, numProductos: 1, estado: 'En Camino', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#5028', cliente: 'Pepe xxxxxx', total: 250.00, numProductos: 4, estado: 'Entregado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#4620', cliente: 'Pepe xxxxxx', total: 35.00, numProductos: 1, estado: 'Cancelado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#4852', cliente: 'Pepe xxxxxx', total: 578.00, numProductos: 15, estado: 'Procesando', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#8811', cliente: 'Pepe xxxxxx', total: 345.00, numProductos: 7, estado: 'Entregado', tipoEntrega: 'Recoger Tienda', fechaHora: '12/11/25 - 9:00' },
    { id: '#3586', cliente: 'Pepe xxxxxx', total: 560.00, numProductos: 2, estado: 'Entregado', tipoEntrega: 'Recoger Tienda', fechaHora: '12/11/25 - 8:00' },
    { id: '#1374', cliente: 'Pepe xxxxxx', total: 150.00, numProductos: 2, estado: 'Entregado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#7791', cliente: 'Pepe xxxxxx', total: 60.00, numProductos: 2, estado: 'Entregado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#4945', cliente: 'Pepe xxxxxx', total: 23.00, numProductos: 1, estado: 'Entregado', tipoEntrega: 'Recoger Tienda', fechaHora: '12/11/25 - 9:00' },
    { id: '#5548', cliente: 'Pepe xxxxxx', total: 23.00, numProductos: 1, estado: 'Entregado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
    { id: '#1577', cliente: 'Pepe xxxxxx', total: 23.00, numProductos: 1, estado: 'Cancelado', tipoEntrega: 'Domicilio', fechaHora: '12/11/25 - 9:00' },
];

// ----------------------------------------------------
// 2. COMPONENTES DE VISTA
// ----------------------------------------------------

/**
 * Componente que muestra el estado del pedido con colores y iconos.
 */
const EstadoBadge: React.FC<{ estado: EstadoPedido }> = ({ estado }) => {
    let style = { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: Clock };
    
    switch (estado) {
        case 'Procesando':
            style = { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Clock };
            break;
        case 'En Camino':
            style = { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: Truck };
            break;
        case 'Entregado':
            style = { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle };
            break;
        case 'Cancelado':
            style = { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: XCircle };
            break;
        case 'Recoger Tienda':
            style = { bgColor: 'bg-purple-100', textColor: 'text-purple-700', icon: ShoppingBag };
            break;
    }

    const Icon = style.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
            <Icon size={14} className="mr-1" />
            {estado}
        </span>
    );
};

// ----------------------------------------------------
// 3. PÁGINA PRINCIPAL (AdminPedidosPage)
// ----------------------------------------------------

export default function AdminPedidosPage() {
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroFecha, setFiltroFecha] = useState('DD/MM/AAAA');
    const [busqueda, setBusqueda] = useState('');

    // Obtener la lista de estados únicos para el filtro
    const estadosDisponibles = ['Todos', ...Array.from(new Set(mockPedidos.map(p => p.estado)))];

    // Filtrar los pedidos
    const pedidosFiltrados = mockPedidos.filter(pedido => {
        const estadoMatch = filtroEstado === 'Todos' || pedido.estado === filtroEstado;
        // Lógica de búsqueda simplificada por ID o cliente
        const busquedaMatch = pedido.id.includes(busqueda) || pedido.cliente.toLowerCase().includes(busqueda.toLowerCase());
        
        // No implementamos filtro de fecha avanzado para este mock, solo el placeholder
        return estadoMatch && busquedaMatch;
    });

    // Función de acción para el pedido (simulada)
    const handleAction = (pedidoId: string, action: string) => {
        console.log(`Acción [${action}] ejecutada para el pedido ID: ${pedidoId}`);
        // Aquí iría la lógica para asignar un repartidor, ver detalle o anular.
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido de Gestión de Pedidos */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">Gestión de Pedidos</h1>

                        {/* Controles de Filtro y Búsqueda */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                            
                            {/* Búsqueda por ID/Cliente */}
                            <div className="relative flex-grow w-full md:w-auto">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por ID o Cliente..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                                />
                            </div>

                            {/* Filtro por Estado */}
                            <div className="relative w-full md:w-48">
                                <select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                                >
                                    <option value="Todos">Filtrar por Estado: Todos</option>
                                    {estadosDisponibles.filter(e => e !== 'Todos').map(estado => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                            </div>
                            
                            {/* Filtro por Fecha (Placeholder) */}
                            <div className="relative w-full md:w-48">
                                <input
                                    type="text"
                                    placeholder="Filtrar por Fecha: DD/MM/AAAA"
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Tabla de Pedidos */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Pedido</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo Entrega</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pedidosFiltrados.map((pedido) => (
                                        <tr key={pedido.id} className="hover:bg-red-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pedido.cliente}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#F40009]">
                                                Bs. {pedido.total.toFixed(2)} ({pedido.numProductos} Productos)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EstadoBadge estado={pedido.estado} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pedido.tipoEntrega}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{pedido.fechaHora}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                                                    {(pedido.estado === 'Procesando' || pedido.estado === 'Recoger Tienda') && (
                                                        <button 
                                                            onClick={() => handleAction(pedido.id, 'Asignar')}
                                                            className="text-blue-600 hover:text-blue-800 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                                        >
                                                            Asignar Repartidor
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleAction(pedido.id, 'Ver Detalle')}
                                                        className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                                    >
                                                        Ver Detalle
                                                    </button>
                                                    {(pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado') && (
                                                        <button 
                                                            onClick={() => handleAction(pedido.id, 'Anular')}
                                                            className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap text-xs sm:text-sm"
                                                        >
                                                            Anular Pedido
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paginación (Placeholder) */}
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                            <span>Mostrando 1 - {pedidosFiltrados.length} de {mockPedidos.length} pedidos</span>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border rounded-lg hover:bg-gray-100" disabled>Anterior</button>
                                <button className="px-3 py-1 border rounded-lg bg-[#F40009] text-white">1</button>
                                <button className="px-3 py-1 border rounded-lg hover:bg-gray-100">Siguiente</button>
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}