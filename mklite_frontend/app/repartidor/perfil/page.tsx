"use client";

import React, { useState } from 'react';
import RepartidorSidebar from '../../components/RepartidorSidebar'; // Asegúrate de que esta ruta sea correcta
import { CheckCircle, Star, TrendingDown, DollarSign, Edit, Save, LucideIcon } from 'lucide-react';

// ----------------------------------------------------
// 1. DEFINICIÓN DE TIPOS
// ----------------------------------------------------
/**
 * Interfaz para tipar los datos de las métricas de rendimiento.
 */
interface Metrica {
    titulo: string;
    valor: string;
    subtexto: string;
    icono: LucideIcon; 
}

// MOCK DATA para el rendimiento
const metricasRendimiento: Metrica[] = [
    { 
        titulo: 'Entregas Exitosas', 
        valor: '450', 
        subtexto: 'Total a la fecha. Métrica de productividad principal.', 
        icono: CheckCircle 
    },
    { 
        titulo: 'Calificación Promedio', 
        valor: '4.8 / 5.0', 
        subtexto: 'Basado en últimas 50 entregas. Métrica de calidad y servicio al cliente.', 
        icono: Star 
    },
    { 
        titulo: 'Tasa de Falla', 
        valor: '2.5%', 
        subtexto: 'Pedidos reportados como Fallidos. Métrica de eficiencia.', 
        icono: TrendingDown 
    },
    { 
        titulo: 'Total Recaudado', 
        valor: 'Bs: 12.000', 
        subtexto: 'Recaudado este mes. Métrica financiera importante para la reconciliación.', 
        icono: DollarSign 
    },
];

// ----------------------------------------------------
// 2. COMPONENTE METRICACARD
// ----------------------------------------------------
const MetricaCard: React.FC<Metrica> = ({ titulo, valor, subtexto, icono: Icon }) => (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 text-center flex flex-col justify-between">
        <div className="flex justify-center items-center mb-2">
            <Icon size={24} className="text-[#F40009]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">{titulo}</h3>
        <p className="text-4xl font-extrabold text-gray-900 my-2">{valor}</p>
        <p className="text-xs text-gray-500 mt-2">{subtexto}</p>
    </div>
);

// ----------------------------------------------------
// 3. PÁGINA PRINCIPAL (RepartidorPerfilPage)
// ----------------------------------------------------
export default function RepartidorPerfilPage() {
    // Estado del repartidor: disponible o no
    const [isAvailable, setIsAvailable] = useState(true);

    // Estado para la información personal (MOCK)
    const [userInfo, setUserInfo] = useState({
        nombreCompleto: 'Pepe Maiz',
        correoElectronico: 'pepe.maiz@gmail.com',
        telefono: '7894567',
        licenciaCI: '8954780',
    });
    const [isEditing, setIsEditing] = useState(false);

    // Manejador para la edición de inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Lógica para enviar los datos actualizados a la API
        console.log("Guardando información:", userInfo);
        setIsEditing(false);
        // Aquí se podría mostrar un toast o mensaje de éxito
    };

    // Switch de disponibilidad
    const AvailabilitySwitch = () => (
        <div 
            onClick={() => setIsAvailable(!isAvailable)}
            className="cursor-pointer flex items-center mb-6 p-2 rounded-lg transition-all duration-300 hover:bg-gray-50"
        >
            <div 
                className={`flex items-center rounded-full p-1 w-16 transition-colors duration-300 ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-8 bg-white' : 'translate-x-0 bg-white'}`}></div>
            </div>
            <span className={`ml-3 text-sm font-bold ${isAvailable ? 'text-green-700' : 'text-gray-500'}`}>
                Actualmente <span className="uppercase">{isAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE'}</span> para recibir pedidos
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        {/* Se llama al Sidebar sin props (activePage) para evitar el error de tipado. 
                            Asume que el Sidebar usa usePathname() para saber la página activa. */}
                        <RepartidorSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido del Perfil */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">Mi Perfil y Rendimiento</h1>

                        {/* 1. Switch de Disponibilidad */}
                        <div className="bg-red-50 p-4 rounded-xl mb-8 border border-red-100">
                             <h2 className="text-xl font-bold text-[#F40009] mb-2">Estado de Servicio</h2>
                            <AvailabilitySwitch />
                        </div>

                        {/* 2. Métricas de Rendimiento */}
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tu Rendimiento Clave</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {metricasRendimiento.map((metrica) => (
                                    <MetricaCard key={metrica.titulo} {...metrica} />
                                ))}
                            </div>
                        </section>

                        {/* 3. Información Personal */}
                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6 border-b pb-3">
                                <h2 className="text-xl font-bold text-gray-800">Detalles de la Cuenta</h2>
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className={`p-2 rounded-full transition duration-200 shadow-md ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-[#F40009] text-white hover:bg-red-700'}`}
                                    aria-label={isEditing ? "Guardar" : "Editar"}
                                >
                                    {isEditing ? <Save size={20} /> : <Edit size={20} />}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre Completo */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="nombreCompleto"
                                        value={userInfo.nombreCompleto}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Correo Electrónico */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="correoElectronico"
                                        value={userInfo.correoElectronico}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={userInfo.telefono}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Licencia/CI */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Licencia/CI</label>
                                    <input
                                        type="text"
                                        name="licenciaCI"
                                        value={userInfo.licenciaCI}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>

                            {/* Botón de acción */}
                            <div className="mt-8 flex justify-start">
                                {!isEditing && (
                                    <button 
                                        onClick={() => console.log("Lógica para cambiar contraseña")}
                                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors active:scale-95"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}