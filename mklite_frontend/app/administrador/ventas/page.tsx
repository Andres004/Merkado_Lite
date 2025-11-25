"use client";

import React from 'react';
import AdminSidebar from '../../components/AdminSidebar'; // Asume que la ruta es correcta
import { PlusCircle, RefreshCcw } from 'lucide-react';

// ----------------------------------------------------
// 1. DEFINICIÓN DE TIPOS Y MOCK DATA
// ----------------------------------------------------

// Tipo para el tipo de transacción
type TipoTransaccion = 'Venta Online' | 'Venta Presencial' | 'Devolución';

// Interfaz para una transacción individual
interface Transaccion {
    id: string;
    tipo: TipoTransaccion;
    fechaHora: string;
    cliente: string;
    idPedido: string;
    total: number;
    numProductos: number;
}

// Datos simulados (MOCK DATA)
const mockTransacciones: Transaccion[] = [
    { id: 'V-104', tipo: 'Venta Online', fechaHora: '12/11/25 - 9:00', cliente: 'Pepe xxxxxx', idPedido: '#3933', total: 150.00, numProductos: 2 },
    { id: 'V-145', tipo: 'Venta Presencial', fechaHora: '10/11/25 - 10:00', cliente: 'Ana yyyyyy', idPedido: '#5045', total: 60.00, numProductos: 2 },
    { id: 'V-103', tipo: 'Devolución', fechaHora: '05/11/25 - 8:00', cliente: 'Juan zzzzzz', idPedido: '#5028', total: 100.00, numProductos: 2 },
    { id: 'V-146', tipo: 'Venta Online', fechaHora: '08/11/25 - 13:00', cliente: 'Pepe xxxxxx', idPedido: '#4600', total: 35.00, numProductos: 1 },
    { id: 'V-104', tipo: 'Venta Online', fechaHora: '12/11/25 - 9:00', cliente: 'Ana yyyyyy', idPedido: '#3933', total: 150.00, numProductos: 2 },
    { id: 'V-145', tipo: 'Venta Presencial', fechaHora: '10/11/25 - 10:00', cliente: 'Juan zzzzzz', idPedido: '#5045', total: 60.00, numProductos: 2 },
    { id: 'V-103', tipo: 'Devolución', fechaHora: '05/11/25 - 8:00', cliente: 'Pepe xxxxxx', idPedido: '#5028', total: 100.00, numProductos: 2 },
    { id: 'V-146', tipo: 'Venta Online', fechaHora: '08/11/25 - 13:00', cliente: 'Ana yyyyyy', idPedido: '#4600', total: 35.00, numProductos: 1 },
    { id: 'V-104', tipo: 'Venta Online', fechaHora: '12/11/25 - 9:00', cliente: 'Juan zzzzzz', idPedido: '#3933', total: 150.00, numProductos: 2 },
    { id: 'V-145', tipo: 'Venta Presencial', fechaHora: '10/11/25 - 10:00', cliente: 'Pepe xxxxxx', idPedido: '#5045', total: 60.00, numProductos: 2 },
    { id: 'V-103', tipo: 'Devolución', fechaHora: '05/11/25 - 8:00', cliente: 'Ana yyyyyy', idPedido: '#5028', total: 100.00, numProductos: 2 },
    { id: 'V-146', tipo: 'Venta Online', fechaHora: '08/11/25 - 13:00', cliente: 'Juan zzzzzz', idPedido: '#4600', total: 35.00, numProductos: 1 },
];

// ----------------------------------------------------
// 2. COMPONENTES DE VISTA
// ----------------------------------------------------

/**
 * Componente que muestra el tipo de transacción con colores específicos.
 */
const TipoTransaccionBadge: React.FC<{ tipo: TipoTransaccion }> = ({ tipo }) => {
    let style = { bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    
    switch (tipo) {
        case 'Venta Online':
            style = { bgColor: 'bg-green-100', textColor: 'text-green-700' };
            break;
        case 'Venta Presencial':
            style = { bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
            break;
        case 'Devolución':
            style = { bgColor: 'bg-red-100', textColor: 'text-red-700' };
            break;
    }

    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
            {tipo}
        </span>
    );
};

// ----------------------------------------------------
// 3. PÁGINA PRINCIPAL (AdminVentasPage)
// ----------------------------------------------------

export default function AdminVentasPage() {
    // Estado simulado para la búsqueda
    const [busqueda, setBusqueda] = React.useState('');
    const [paginaActual, setPaginaActual] = React.useState(1);
    const transaccionesPorPagina = 10;

    // Lógica de filtrado de búsqueda (simplificada por ID de Transacción)
    const transaccionesFiltradas = mockTransacciones.filter(t => 
        t.id.toLowerCase().includes(busqueda.toLowerCase()) || 
        t.idPedido.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Lógica de paginación
    const totalPaginas = Math.ceil(transaccionesFiltradas.length / transaccionesPorPagina);
    const inicio = (paginaActual - 1) * transaccionesPorPagina;
    const fin = inicio + transaccionesPorPagina;
    const transaccionesPagina = transaccionesFiltradas.slice(inicio, fin);

    // Funciones de acción simuladas
    const handleRegistrarVenta = () => alert('Abriendo modal para registrar una nueva Venta Presencial...');
    const handleRegistrarDevolucion = () => alert('Abriendo modal para registrar una Devolución...');
    const handleVerDetalle = (id: string) => console.log(`Viendo detalle de la transacción: ${id}`);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido de Registro de Transacciones */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3 space-y-4 sm:space-y-0">
                            <h1 className="text-3xl font-extrabold text-gray-900">Registro de Transacciones</h1>
                            
                            {/* Botones de Acción */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRegistrarVenta}
                                    className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150 text-sm whitespace-nowrap"
                                >
                                    <PlusCircle size={18} className="mr-1 hidden sm:inline" />
                                    Registrar Venta Presencial
                                </button>
                                <button
                                    onClick={handleRegistrarDevolucion}
                                    className="flex items-center bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition duration-150 text-sm whitespace-nowrap"
                                >
                                    <RefreshCcw size={18} className="mr-1 hidden sm:inline" />
                                    Registrar Devolución
                                </button>
                            </div>
                        </div>
                        
                        {/* Control de Búsqueda (Opcional, no visible en la imagen, pero útil) */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por ID de Transacción o Pedido..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1); // Resetear a la primera página al buscar
                                }}
                                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                            />
                        </div>


                        {/* Tabla de Transacciones */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID TRANSACCIÓN</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TIPO</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">FECHA/HORA</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID PEDIDO</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transaccionesPagina.map((t, index) => (
                                        <tr key={index} className="hover:bg-red-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <TipoTransaccionBadge tipo={t.tipo} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.fechaHora}</td>
                                            {/* Usamos un placeholder para cliente por la privacidad de la captura */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">######</td> 
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.idPedido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                Bs. {t.total.toFixed(2)} ({t.numProductos} Productos)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button 
                                                    onClick={() => handleVerDetalle(t.id)}
                                                    className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                                                >
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paginación */}
                        <div className="mt-6 flex justify-center items-center text-sm">
                            <nav className="flex items-center space-x-1">
                                <button 
                                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                    disabled={paginaActual === 1}
                                    className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    &lt;
                                </button>
                                
                                {/* Mostrar un indicador simple de página si hay muchas */}
                                <span className="px-4 py-2 font-semibold bg-[#F40009] text-white rounded-full">
                                    Página {paginaActual} de {totalPaginas}
                                </span>
                                
                                <button 
                                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaActual === totalPaginas}
                                    className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    &gt;
                                </button>
                            </nav>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}