"use client";

import React from 'react';
import AdminSidebar from '../../components/AdminSidebar'; 
import { PlusCircle } from 'lucide-react';

// ----------------------------------------------------
// 1. DEFINICIÓN DE TIPOS Y MOCK DATA
// ----------------------------------------------------

// Tipos de descuentos basados en la imagen
type TipoDescuento = 'Cupón' | '2x1' | 'Descuento' | 'Monto Fijo';
type EstadoDescuento = 'Activo' | 'Programada' | 'Expirado';

// Interfaz para una promoción o descuento
interface Descuento {
    id: number;
    nombre: string;
    tipo: TipoDescuento;
    codigo: string; 
    duracion: string;
    estado: EstadoDescuento;
}

// Datos simulados (MOCK DATA)
const mockDescuentos: Descuento[] = [
    { id: 1, nombre: 'Cupón de Bienvenida', tipo: 'Cupón', codigo: 'MERKADO25', duracion: '15 Nov - 20 Nov', estado: 'Activo' },
    { id: 2, nombre: '2x1 en Lácteos', tipo: '2x1', codigo: 'N/A', duracion: '15 Nov - 20 Nov', estado: 'Programada' },
    { id: 3, nombre: 'Solo hoy 15% en Carnes', tipo: 'Descuento', codigo: 'Automático', duracion: '15 Nov - 16 Nov', estado: 'Expirado' },
    { id: 4, nombre: 'Ahorra Bs. 10 en Lácteos', tipo: 'Monto Fijo', codigo: 'Automático', duracion: '15 Nov - 20 Nov', estado: 'Activo' },
    { id: 5, nombre: 'Cupón de Bienvenida', tipo: 'Cupón', codigo: 'MERKADO25', duracion: '15 Nov - 20 Nov', estado: 'Activo' },
    { id: 6, nombre: '2x1 en Lácteos', tipo: '2x1', codigo: 'N/A', duracion: '15 Nov - 20 Nov', estado: 'Programada' },
    { id: 7, nombre: '2x1 en Congelados', tipo: '2x1', codigo: 'N/A', duracion: '15 Nov - 16 Nov', estado: 'Expirado' },
    { id: 8, nombre: 'Cupón de Bienvenida', tipo: 'Cupón', codigo: 'MERKADO25', duracion: '15 Nov - 20 Nov', estado: 'Activo' },
    { id: 9, nombre: '2x1 en Lácteos', tipo: '2x1', codigo: 'N/A', duracion: '15 Nov - 20 Nov', estado: 'Programada' },
    { id: 10, nombre: '2x1 en Congelados', tipo: '2x1', codigo: 'N/A', duracion: '15 Nov - 16 Nov', estado: 'Expirado' },
    { id: 11, nombre: 'Cupón de Bienvenida', tipo: 'Cupón', codigo: 'MERKADO25', duracion: '15 Nov - 20 Nov', estado: 'Activo' },
];

// ----------------------------------------------------
// 2. COMPONENTES DE VISTA
// ----------------------------------------------------

/**
 * Componente que muestra el tipo de descuento con colores específicos.
 */
const TipoDescuentoBadge: React.FC<{ tipo: TipoDescuento }> = ({ tipo }) => {
    let style = { bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    
    // Asignación de colores basados en la imagen y consistencia UI
    switch (tipo) {
        case 'Cupón':
            style = { bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
            break;
        case '2x1':
            style = { bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
            break;
        case 'Descuento':
            style = { bgColor: 'bg-red-100', textColor: 'text-red-700' };
            break;
        case 'Monto Fijo':
            style = { bgColor: 'bg-green-100', textColor: 'text-green-700' };
            break;
    }

    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
            {tipo}
        </span>
    );
};

/**
 * Componente que muestra el estado del descuento con colores.
 */
const EstadoDescuentoBadge: React.FC<{ estado: EstadoDescuento }> = ({ estado }) => {
    let style = { bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    
    switch (estado) {
        case 'Activo':
            style = { bgColor: 'bg-green-100', textColor: 'text-green-700' };
            break;
        case 'Programada':
            style = { bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
            break;
        case 'Expirado':
            style = { bgColor: 'bg-red-100', textColor: 'text-red-700' };
            break;
    }

    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
            {estado}
        </span>
    );
};


// ----------------------------------------------------
// 3. PÁGINA PRINCIPAL (AdminDescuentosPage)
// ----------------------------------------------------

export default function AdminDescuentosPage() {
    // Estado de prueba para acciones
    const handleCrear = () => alert('Abriendo formulario para crear nuevo descuento...');
    const handleEditar = (nombre: string) => alert(`Editando descuento: ${nombre}`);
    const handleEliminar = (nombre: string) => confirm(`¿Estás seguro de eliminar el descuento: ${nombre}? (Simulación)`);
    const handleActivarDesactivar = (nombre: string, estado: EstadoDescuento) => {
        const nuevaAccion = estado === 'Activo' ? 'Desactivar' : 'Activar';
        alert(`${nuevaAccion} descuento: ${nombre} (Simulación)`);
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

                    {/* Columna Derecha: Contenido de Gestión de Descuentos */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Descuentos y Promociones</h1>
                            
                            {/* Botón Crear Nuevo Descuento */}
                            <button
                                onClick={handleCrear}
                                className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Crear Nuevo Descuento
                            </button>
                        </div>

                        {/* Tabla de Descuentos */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NOMBRE DESCUENTO</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TIPO</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CÓDIGO</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">DURACIÓN</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ESTADO</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mockDescuentos.map((d) => (
                                        <tr key={d.id} className="hover:bg-red-50 transition duration-150">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.nombre}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <TipoDescuentoBadge tipo={d.tipo} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{d.codigo}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{d.duracion}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <EstadoDescuentoBadge estado={d.estado} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-3">
                                                    <button 
                                                        onClick={() => handleEditar(d.nombre)}
                                                        className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEliminar(d.nombre)}
                                                        className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                                                    >
                                                        Eliminar
                                                    </button>
                                                    
                                                    {d.estado !== 'Expirado' && (
                                                        <button 
                                                            onClick={() => handleActivarDesactivar(d.nombre, d.estado)}
                                                            className={`whitespace-nowrap ${
                                                                d.estado === 'Activo' 
                                                                    ? 'text-yellow-600 hover:text-yellow-800'
                                                                    : 'text-green-600 hover:text-green-800'
                                                            } transition duration-150`}
                                                        >
                                                            {d.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Nota: No hay paginación visible en la imagen, se omite por simplicidad */}

                    </main>
                </div>
            </div>
        </div>
    );
}