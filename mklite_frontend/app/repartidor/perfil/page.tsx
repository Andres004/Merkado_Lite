"use client";

//import React, { useState } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import RepartidorSidebar from '../../components/RepartidorSidebar'; // Asegúrate de que esta ruta sea correcta
import { CheckCircle, Star, TrendingDown, DollarSign, Edit, Save, LucideIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getShipmentHistory, getUserProfile, updateUserProfile } from '../../services/shipment.service';
import { changePassword } from '../../services/user.service';
import { Shipment } from '../../types/shipment';

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
    const [isEditing, setIsEditing] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        ci: '',
    });
    //const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [metricsError, setMetricsError] = useState<string | null>(null);
    const [deliveredShipments, setDeliveredShipments] = useState<Shipment[]>([]);
    const [failedShipments, setFailedShipments] = useState<Shipment[]>([]);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) return;
        try {
            const parsed = JSON.parse(storedUser);
            setUserId(parsed.id_usuario);
            setUserInfo((prev) => ({
                ...prev,
                nombre: parsed.nombre ?? '',
                apellido: parsed.apellido ?? '',
                email: parsed.email ?? '',
                telefono: parsed.telefono ?? '',
                direccion: parsed.direccion ?? '',
                ci: parsed.ci ?? '',
            }));
        } catch (error) {
            console.error('No se pudo leer userData', error);
        }
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadProfile(userId);
        loadMetrics(userId);
    }, [userId]);

    const loadProfile = async (id: number) => {
        setLoading(true);
        try {
            const data = await getUserProfile(id);
            setUserInfo({
                nombre: data.nombre ?? '',
                apellido: data.apellido ?? '',
                email: data.email ?? '',
                telefono: data.telefono ?? '',
                direccion: data.direccion ?? '',
                ci: data.ci ?? '',
            });
        } catch (error) {
            console.error('Error al cargar perfil', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMetrics = async (id: number) => {
        setMetricsLoading(true);
        setMetricsError(null);
        try {
            const [delivered, failed] = await Promise.all([
                getShipmentHistory(id, 'entregado'),
                getShipmentHistory(id, 'fallido'),
            ]);
            setDeliveredShipments(Array.isArray(delivered) ? delivered : []);
            setFailedShipments(Array.isArray(failed) ? failed : []);
        } catch (error) {
            console.error('Error al cargar métricas', error);
            setMetricsError('No se pudieron cargar tus métricas. Intenta nuevamente.');
        } finally {
            setMetricsLoading(false);
        }
    };


    // Manejador para la edición de inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateUserProfile(userId, {
                nombre: userInfo.nombre,
                apellido: userInfo.apellido,
                email: userInfo.email,
                telefono: userInfo.telefono,
                direccion: userInfo.direccion,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('No se pudo actualizar el perfil', error);
        } finally {
            setLoading(false);
        }
    };

    const parseNumber = (value?: number | string | null) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        return 0;
    };

    const totalDelivered = useMemo(() => deliveredShipments.length, [deliveredShipments]);
    const totalFailed = useMemo(() => failedShipments.length, [failedShipments]);

    const totalCollected = useMemo(() => {
        return deliveredShipments.reduce((acc, item) => acc + parseNumber(item.order?.total), 0);
    }, [deliveredShipments]);

    const failureRate = useMemo(() => {
        const total = totalDelivered + totalFailed;
        if (total === 0) return 0;
        return (totalFailed / total) * 100;
    }, [totalDelivered, totalFailed]);

    const averageRating = useMemo(() => {
        const ratings = deliveredShipments
            .map((item) => item.calificacion_cliente)
            .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(Number(value)))
            .map((value) => Number(value));

        if (!ratings.length) return null;
        const sum = ratings.reduce((acc, value) => acc + value, 0);
        return sum / ratings.length;
    }, [deliveredShipments]);

    const metricasRendimiento: Metrica[] = useMemo(() => [
        {
            titulo: 'Entregas Exitosas',
            valor: `${totalDelivered}`,
            subtexto: 'Total entregados con éxito.',
            icono: CheckCircle,
        },
        {
            titulo: 'Calificación Promedio',
            valor: averageRating !== null ? `${averageRating.toFixed(1)} / 5.0` : '—',
            subtexto: 'Basado en entregas calificadas.',
            icono: Star,
        },
        {
            titulo: 'Tasa de Falla',
            valor: `${failureRate.toFixed(1)}%`,
            subtexto: 'Fallidos vs total de entregas.',
            icono: TrendingDown,
        },
        {
            titulo: 'Total Recaudado',
            valor: `Bs: ${totalCollected.toFixed(2)}`,
            subtexto: 'Monto de envíos entregados.',
            icono: DollarSign,
        },
    ], [totalDelivered, averageRating, failureRate, totalCollected]);

    const handlePasswordInputChange = (field: 'current' | 'new' | 'confirm', value: string) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const resetPasswordState = (options?: { keepSuccess?: boolean }) => {
        setPasswordForm({ current: '', new: '', confirm: '' });
        setShowPassword({ current: false, new: false, confirm: false });
        setPasswordError(null);
        if (!options?.keepSuccess) {
            setPasswordSuccess(null);
        }
        setPasswordLoading(false);
    };

    const handlePasswordSubmit = async () => {
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
            setPasswordError('Completa todos los campos.');
            return;
        }

        if (passwordForm.new.length < 8) {
            setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordError('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        if (!userId) {
            setPasswordError('No se pudo identificar al usuario.');
            return;
        }

        setPasswordError(null);
        setPasswordSuccess(null);
        setPasswordLoading(true);

        try {
            await changePassword({
                //userId,
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new,
            });
            setPasswordSuccess('Contraseña actualizada correctamente.');
            setIsPasswordModalOpen(false);
            resetPasswordState({ keepSuccess: true });
        } catch (error) {
            console.error('Error al cambiar contraseña', error);
            setPasswordError('No se pudo actualizar la contraseña. Intenta nuevamente.');
        } finally {
            setPasswordLoading(false);
        }
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
                            {metricsError && (
                                <p className="text-sm text-red-600 mb-3">{metricsError}</p>
                            )}
                            {metricsLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                                            <div className="animate-pulse space-y-3">
                                                <div className="h-6 bg-gray-200 rounded w-10 mx-auto"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                                <div className="h-4 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {metricasRendimiento.map((metrica) => (
                                        <MetricaCard key={metrica.titulo} {...metrica} />
                                    ))}
                                </div>
                            )}
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
                                    
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={userInfo.nombre}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={userInfo.apellido}
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
                                        name="email"
                                        value={userInfo.email}
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
                                    
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={userInfo.direccion}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all ${isEditing ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-200' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">CI</label>
                                    <input
                                        type="text"
                                        name="ci"
                                        value={userInfo.ci}
                                        onChange={handleInputChange}
                                        disabled
                                        className={`w-full p-3 border rounded-lg text-gray-900 focus:outline-none transition-all border-gray-300 bg-gray-100 cursor-not-allowed`}
                                    />
                                </div>
                            </div>

                            {/* Botón de acción */}
                            <div className="mt-8 flex justify-start">
                                {!isEditing && (
                                   <button
                                        onClick={() => {
                                            setIsPasswordModalOpen(true);
                                            setPasswordError(null);
                                        }}
                                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors active:scale-95"
                                    >
                                        Cambiar Contraseña
                                    </button>
                                )}
                            </div>
                            {passwordSuccess && (
                                <p className="text-sm text-green-600 mt-3">{passwordSuccess}</p>
                            )}
                        </section>
                    </main>
                </div>
            </div>
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
                            <button
                                onClick={() => {
                                    resetPasswordState();
                                    setIsPasswordModalOpen(false);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        value={passwordForm.current}
                                        onChange={(e) => handlePasswordInputChange('current', e.target.value)}
                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="Introduce tu contraseña actual"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                        aria-label={showPassword.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        value={passwordForm.new}
                                        onChange={(e) => handlePasswordInputChange('new', e.target.value)}
                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="Crea una nueva contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                        aria-label={showPassword.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Mínimo 8 caracteres.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        value={passwordForm.confirm}
                                        onChange={(e) => handlePasswordInputChange('confirm', e.target.value)}
                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="Repite la nueva contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                        aria-label={showPassword.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetPasswordState();
                                        setIsPasswordModalOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePasswordSubmit}
                                    disabled={passwordLoading}
                                    className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {passwordLoading && <Loader2 size={18} className="animate-spin" />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}