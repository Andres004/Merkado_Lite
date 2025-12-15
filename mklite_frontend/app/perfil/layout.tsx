'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Datos del menú para mapearlos fácil
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    document.cookie = 'authToken=; path=/; max-age=0;';
    document.cookie = 'userRole=; path=/; max-age=0;';
    window.location.href = '/';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb simple */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/">Inicio</Link> {'>'} Mi Cuenta {'>'}{' '}
          <span className="text-red-600 font-semibold">{activeItem?.name ?? 'Mi Perfil'}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* ⬅️ MENÚ LATERAL */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 font-bold text-gray-800">
                Menú
              </div>
              <nav className="flex flex-col">
                {menuItems.map((item) => {
                  
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        isActive 
                          ? 'bg-gray-50 border-l-4 border-red-600 text-red-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Botón Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors w-full text-left border-t border-gray-100"
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* ➡️ CONTENIDO PRINCIPAL (Aquí se renderizan las page.tsx) */}
          <main className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}