'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser, updateCurrentUser, changePassword } from '@/app/services/user.service';
import { UserModel } from '@/app/models/user.model';
import { User, Mail, Phone, MapPin, CreditCard, Lock, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<UserModel>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  
  // Estados de feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadUser = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchCurrentUser();
        setForm({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          ci: data.ci,
          telefono: data.telefono,
          direccion: data.direccion,
        });
        localStorage.setItem('userData', JSON.stringify(data));
      } catch (err: any) {
        const message = err?.response?.data?.message || 'No pudimos cargar tu información.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateCurrentUser(form);
      setSuccess('Perfil actualizado correctamente.');
      localStorage.setItem('userData', JSON.stringify(updated));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No pudimos actualizar tu perfil.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No pudimos actualizar tu contraseña.';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-64">
          <div className="h-8 w-8 bg-[#F40009] rounded-full animate-bounce mb-4"></div>
          <p className="text-gray-400 text-sm">Cargando datos...</p>
      </div>
  );

  // Clases CSS reutilizables
  // Borde más oscuro (gray-400) y texto NEGRO (text-black)
  const inputClasses = "w-full px-4 py-3 bg-white border border-gray-400 rounded-xl text-black font-semibold focus:outline-none focus:!border-[#F40009] focus:!ring-1 focus:!ring-[#F40009] transition-all placeholder-gray-400";
  
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#F40009] transition-colors";
  
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F40009] transition-colors";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      
      {/* Header con botón atrás */}
      <div className="flex items-center gap-4 mb-8">
          <Link href="/perfil" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
              <ArrowLeft size={20} />
          </Link>
          {/* TÍTULO PRINCIPAL: ROJO FORZADO */}
          <h1 
            className="text-3xl font-extrabold !text-[#F40009]" 
            style={{ color: '#F40009' }}
          >
            Editar Perfil
          </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO DATOS */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* BLOQUE 1: DATOS PERSONALES */}
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#F40009]"></div>
                
                {/* SUBTÍTULO: ROJO FORZADO */}
                <h2 
                    className="text-xl font-bold mb-6 flex items-center gap-2 !text-[#F40009]"
                    style={{ color: '#F40009' }}
                >
                    <User size={24} /> 
                    Información Personal
                </h2>

                {success && <div className="p-4 mb-6 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2 text-sm font-medium">✅ {success}</div>}
                {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-medium">⚠️ {error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="group">
                        <label className={labelClasses}>Nombre</label>
                        <input
                            name="nombre"
                            type="text"
                            value={form.nombre || ''}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Tu nombre"
                        />
                    </div>
                    {/* Apellido */}
                    <div className="group">
                        <label className={labelClasses}>Apellido</label>
                        <input
                            name="apellido"
                            type="text"
                            value={form.apellido || ''}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Tu apellido"
                        />
                    </div>
                    
                    {/* Email */}
                    <div className="md:col-span-2 group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                value={form.email || ''}
                                onChange={handleChange}
                                // Readonly un poco más suave
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 font-medium focus:outline-none cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* CI */}
                    <div className="group">
                        <label className={labelClasses}>Cédula (CI)</label>
                        <div className="relative">
                            <CreditCard size={18} className={iconClasses} />
                            <input
                                name="ci"
                                type="text"
                                value={form.ci || ''}
                                onChange={handleChange}
                                className={inputClasses.replace('px-4', 'pl-12 pr-4')}
                                placeholder="Ej: 1234567"
                            />
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div className="group">
                        <label className={labelClasses}>Teléfono</label>
                        <div className="relative">
                            <Phone size={18} className={iconClasses} />
                            <input
                                name="telefono"
                                type="text"
                                value={form.telefono || ''}
                                onChange={handleChange}
                                className={inputClasses.replace('px-4', 'pl-12 pr-4')}
                                placeholder="Ej: 77712345"
                            />
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2 group">
                        <label className={labelClasses}>Dirección Principal</label>
                        <div className="relative">
                            <MapPin size={18} className={iconClasses} />
                            <input
                                name="direccion"
                                type="text"
                                value={form.direccion || ''}
                                onChange={handleChange}
                                className={inputClasses.replace('px-4', 'pl-12 pr-4')}
                                placeholder="Ej: Av. Las Américas #123"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 bg-[#F40009] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-red-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                        ${saving ? 'cursor-wait' : ''}`}
                    >
                        <Save size={20} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
              </form>
          </div>

          {/* COLUMNA DERECHA: CAMBIO CONTRASEÑA */}
          <div className="lg:col-span-1">
              <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm sticky top-24 group">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 group-focus-within:text-[#F40009] transition-colors">
                    <Lock size={20} className="text-gray-400 group-focus-within:text-[#F40009] transition-colors" />
                    Seguridad
                </h3>

                {passwordSuccess && <div className="p-3 mb-4 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">✅ {passwordSuccess}</div>}
                {passwordError && <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">⚠️ {passwordError}</div>}

                <div className="space-y-5">
                    <div className="group/pass">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 group-focus-within/pass:text-[#F40009] transition-colors">Contraseña Actual</label>
                        <input
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-white border border-gray-400 rounded-lg text-black text-sm focus:!border-[#F40009] focus:!ring-1 focus:!ring-[#F40009] focus:outline-none transition-all placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div className="group/pass">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 group-focus-within/pass:text-[#F40009] transition-colors">Nueva Contraseña</label>
                        <input
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-white border border-gray-400 rounded-lg text-black text-sm focus:!border-[#F40009] focus:!ring-1 focus:!ring-[#F40009] focus:outline-none transition-all placeholder-gray-400"
                            placeholder="Nueva clave"
                        />
                    </div>

                    <div className="group/pass">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 group-focus-within/pass:text-[#F40009] transition-colors">Confirmar</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 bg-white border border-gray-400 rounded-lg text-black text-sm focus:!border-[#F40009] focus:!ring-1 focus:!ring-[#F40009] focus:outline-none transition-all placeholder-gray-400"
                            placeholder="Repetir clave"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={passwordSaving}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70 text-sm border-2 border-transparent hover:border-[#F40009]"
                    >
                        {passwordSaving ? 'Actualizando...' : 'Actualizar Clave'}
                    </button>
                </div>
              </form>
          </div>

      </div>
    </div>
  );
}