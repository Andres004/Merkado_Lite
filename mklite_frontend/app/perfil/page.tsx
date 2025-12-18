'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser } from '../services/user.service';
import { UserModel } from '../models/user.model';
import { User, Mail, MapPin, Edit2, ShieldCheck, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCurrentUser();
        setUser(data);
        localStorage.setItem('userData', JSON.stringify(data));
      } catch (err: any) {
        const message = err?.response?.data?.message || 'No pudimos obtener tu perfil.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="h-8 w-8 bg-[#F40009] rounded-full animate-bounce mb-4"></div>
            <p className="text-gray-400 text-sm">Cargando tu perfil...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">
            {error}
        </div>
        <br />
        <button
          onClick={() => router.refresh()}
          className="bg-[#F40009] text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in-up">
      
      {/* 1. HERO SECTION DEL PERFIL */}
      <div className="relative mb-12">
        
        {/* CAMBIO AQUÍ: Banner ROJO VIBRANTE */}
        <div className="h-36 bg-[#F40009] rounded-t-2xl shadow-md"></div>
        
        {/* Avatar y Datos Principales */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-8 -mt-14">
            <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full p-1.5 shadow-xl">
                    <div className="w-full h-full bg-gray-50 border-2 border-gray-100 rounded-full flex items-center justify-center text-gray-300 overflow-hidden relative group">
                        <User size={56} />
                        
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={28} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 text-center md:text-left mb-2 pt-2 md:pt-0">
                {/* CAMBIO AQUÍ: Nombre en ROJO PURO */}
                <h1 className="text-4xl font-extrabold !text-[#F40009] tracking-tight mb-1" style={{ color: '#F40009' }}>
                    {user.nombre} {user.apellido}
                </h1>
                
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 font-medium">
                    <Mail size={16} className="text-gray-400" /> {user.email}
                </p>
            </div>

            <div className="mb-4">
                <Link href="/perfil/editar">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:border-[#F40009] hover:text-[#F40009] transition-all transform hover:-translate-y-0.5">
                        <Edit2 size={18} /> Editar Perfil
                    </button>
                </Link>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 2. TARJETA: INFORMACIÓN PERSONAL */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
             <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg text-[#F40009]">
                    <ShieldCheck size={20} />
                </div>
                Datos Personales
             </h3>
          </div>

          <div className="space-y-6">
            <div>
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
               <p className="text-gray-800 font-medium text-lg">{user.nombre} {user.apellido}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Cédula (CI)</label>
                    <p className="text-gray-800 font-medium">{user.ci || '---'}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Rol</label>
                    <p className="text-gray-800 font-medium bg-gray-50 px-3 py-1 rounded-md inline-block text-sm border border-gray-100">Cliente</p>
                </div>
            </div>
          </div>
        </div>

        {/* 3. TARJETA: DIRECCIÓN Y CONTACTO */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
             <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg text-[#F40009]">
                    <MapPin size={20} />
                </div>
                Dirección de Envío
             </h3>
             <Link href="/perfil/direcciones" className="text-xs font-bold text-[#F40009] hover:underline">
                Gestionar
             </Link>
          </div>

          <div className="space-y-6">
             {user.direccion ? (
                 <div className="flex gap-4 items-start">
                    <div className="mt-1 p-2 bg-gray-50 rounded-full">
                        <MapPin className="text-gray-400" size={20} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dirección Principal</label>
                        <p className="text-gray-800 font-medium leading-relaxed text-lg">
                            {user.direccion}
                        </p>
                    </div>
                 </div>
             ) : (
                 <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                     <p className="text-gray-400 text-sm mb-3">No tienes una dirección registrada</p>
                     <Link href="/perfil/direcciones" className="text-[#F40009] font-bold text-sm hover:underline">
                        + Agregar Dirección
                     </Link>
                 </div>
             )}

             <div className="pt-6 border-t border-gray-50">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Teléfono de Contacto</label>
                <p className="text-gray-800 font-medium text-lg">{user.telefono || 'Sin registrar'}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}