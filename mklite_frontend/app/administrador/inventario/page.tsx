"use client";


import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar'; // Asume que la ruta es correcta
import { PlusCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';


// ----------------------------------------------------
// 1. DEFINICIÓN DE TIPOS Y MOCK DATA
// ----------------------------------------------------


// Tipo para el estado de stock
type EstadoStock = 'En stock' | 'Bajo stock' | 'Agotado';


// Interfaz para un producto en el inventario
interface Producto {
    id: number;
    nombre: string;
    stockTotal: number; // en unidades (uds)
    umbralMinimo: number;
}


// Datos simulados (MOCK DATA)
const mockInventario: Producto[] = [
    { id: 1, nombre: 'Nuggets Dino Sofia 1 kg', stockTotal: 550, umbralMinimo: 50 },
    { id: 2, nombre: 'Leche PIL 1 Litro', stockTotal: 50, umbralMinimo: 50 },
    { id: 3, nombre: 'Dulce de Leche PIL 250 gr', stockTotal: 0, umbralMinimo: 50 },
    { id: 4, nombre: 'Nuggets Patitas Sofia 1 kg', stockTotal: 200, umbralMinimo: 50 },
    { id: 5, nombre: 'Jugo de Naranja Natural 500ml', stockTotal: 10, umbralMinimo: 20 },
    { id: 6, nombre: 'Tomate Perita', stockTotal: 80, umbralMinimo: 100 },
    { id: 7, nombre: 'Leche PIL 1 Litro', stockTotal: 0, umbralMinimo: 50 },
    { id: 8, nombre: 'Agua Embotellada 1L', stockTotal: 300, umbralMinimo: 50 },
    { id: 9, nombre: 'Manzanas Royal Gala 1kg', stockTotal: 45, umbralMinimo: 50 },
    { id: 10, nombre: 'Mantequilla Gloria 500gr', stockTotal: 150, umbralMinimo: 50 },
];


/**
 * Función que calcula el estado del stock
 */
const getEstadoStock = (stockTotal: number, umbralMinimo: number): EstadoStock => {
    if (stockTotal === 0) {
        return 'Agotado';
    }
    if (stockTotal <= umbralMinimo) {
        return 'Bajo stock';
    }
    return 'En stock';
};


// ----------------------------------------------------
// 2. COMPONENTES DE VISTA
// ----------------------------------------------------


/**
 * Componente que muestra el estado del stock con colores e iconos.
 */
const StockBadge: React.FC<{ estado: EstadoStock }> = ({ estado }) => {
    let style = { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: CheckCircle };
   
    switch (estado) {
        case 'Agotado':
            style = { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: XCircle };
            break;
        case 'Bajo stock':
            style = { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: AlertTriangle };
            break;
        case 'En stock':
            style = { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle };
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
// 3. PÁGINA PRINCIPAL (AdminInventarioPage)
// ----------------------------------------------------


export default function AdminInventarioPage() {
    // Estado para la simulación de paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 10;
   
    // Simulación de paginación y datos
    const totalPaginas = Math.ceil(mockInventario.length / productosPorPagina);
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = mockInventario.slice(inicio, fin);


    // Funciones de acción simuladas
    const verLotes = (productoNombre: string) => alert(`Viendo lotes para: ${productoNombre}`);
    const editarUmbral = (productoNombre: string) => {
        const nuevoUmbral = prompt(`Ingrese el nuevo Umbral Mínimo para ${productoNombre}:`);
        if (nuevoUmbral) {
            alert(`Umbral actualizado a: ${nuevoUmbral} para ${productoNombre} (Simulación)`);
        }
    };
    const registrarNuevoLote = () => alert('Abriendo formulario para registrar un nuevo lote...');


    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
               
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                   
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>


                    {/* Columna Derecha: Contenido de Gestión de Inventario */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                       
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Inventario</h1>
                           
                            {/* Botón Registrar Nuevo Lote */}
                            <button
                                onClick={registrarNuevoLote}
                                className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Registrar Nuevo Lote
                            </button>
                        </div>


                        {/* Tabla de Inventario */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PRODUCTO</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STOCK TOTAL</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UMBRAL MÍNIMO</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ESTADO</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {productosPagina.map((producto) => {
                                        const estado = getEstadoStock(producto.stockTotal, producto.umbralMinimo);
                                        return (
                                            <tr key={producto.id} className="hover:bg-red-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{producto.stockTotal} uds</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.umbralMinimo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StockBadge estado={estado} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-4">
                                                        <button
                                                            onClick={() => verLotes(producto.nombre)}
                                                            className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                                                        >
                                                            Ver Lotes
                                                        </button>
                                                        <button
                                                            onClick={() => editarUmbral(producto.nombre)}
                                                            className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap"
                                                        >
                                                            Editar Umbral
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                               
                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setPaginaActual(page)}
                                        className={`px-4 py-2 rounded-full font-semibold transition-colors duration-150 ${
                                            paginaActual === page
                                                ? 'bg-[#F40009] text-white shadow-md'
                                                : 'bg-white text-gray-700 hover:bg-red-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                               
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
