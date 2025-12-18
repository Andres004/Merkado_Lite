'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, MapPin, LogOut, ChevronRight, Home } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Usuario');

  // Cargar nombre para el sidebar
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.nombre || 'Usuario');
    }
  }, []);

  const menuItems = [
    { name: 'Mi Perfil', href: '/perfil', icon: User },
    { name: 'Historial de Pedidos', href: '/perfil/pedidos', icon: Package },
    { name: 'Favoritos', href: '/perfil/favoritos', icon: Heart },
    { name: 'Mis Direcciones', href: '/perfil/direcciones', icon: MapPin },
  ];

  const activeItem = menuItems.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const handleLogout = () => {
    if(!confirm('¿Estás seguro de que quieres cerrar sesión?')) return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    document.cookie = 'authToken=; path=/; max-age=0;';
    document.cookie = 'userRole=; path=/; max-age=0;';
    window.location.href = '/';
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
        
      {/* Header/Breadcrumb Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-[#F40009] transition-colors flex items-center">
                <Home size={16} className="mr-1" /> Inicio
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-300" />
            <span className="text-gray-900 font-medium">Mi Cuenta</span>
            <ChevronRight size={16} className="mx-2 text-gray-300" />
            <span className="font-bold text-[#F40009]">{activeItem?.name ?? 'Perfil'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ⬅️ MENÚ LATERAL */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              
              {/* CAMBIO AQUÍ: Fondo ROJO, texto BLANCO */}
              <div className="p-8 bg-[#F40009] text-center">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-red-400 shadow-md">
                      <User size={36} className="text-[#F40009]" />
                  </div>
                  <h2 className="font-bold text-xl text-white">Hola, {userName}</h2>
                  <p className="text-sm text-red-100 font-medium mt-1">Bienvenido a tu cuenta</p>
              </div>

              {/* Navegación */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive 
                          ? 'bg-red-50 text-[#F40009] shadow-sm font-bold border border-red-100' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#F40009]'
                        }`}
                    >
                      <item.icon size={20} className={isActive ? 'text-[#F40009]' : 'text-gray-400 group-hover:text-[#F40009] transition-colors'} />
                      {item.name}
                      {isActive && <ChevronRight size={16} className="ml-auto text-[#F40009]" />}
                    </Link>
                  );
                })}
                
                <div className="my-2 border-t border-gray-100"></div>

                {/* Botón Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left rounded-xl group"
                >
                  <LogOut size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* ➡️ CONTENIDO PRINCIPAL */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[500px]">
                {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}