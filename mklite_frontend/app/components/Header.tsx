'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const Header = () => {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [user, setUser] = useState<any>(null);

  // Cargar usuario al inicio
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const closeAuth = () => setAuthModal(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <header className="bg-white shadow-md relative z-40">
        {/* ➡️ SECCIÓN SUPERIOR */}
        <div className="flex items-center justify-between p-3 max-w-7xl mx-auto border-b border-gray-100">
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-extrabold text-red-600 cursor-pointer">
            MERKADO LITE
          </Link>
          
          {/* BUSCADOR CENTRAL */}
          <div className="flex-1 max-w-lg mx-12 flex items-center border border-gray-300 rounded-lg overflow-hidden h-10">
            <input 
              type="text" 
              placeholder="¿Qué estás buscando hoy?" 
              className="w-full p-2 focus:outline-none text-sm"
            />
            <button className="bg-gray-700 hover:bg-gray-800 text-white w-14 h-full flex items-center justify-center transition duration-150">
              <Search size={20} />
            </button>
          </div>
          
          {/* ICONOS DE USUARIO Y CARRITO */}
          <div className="flex items-center space-x-6 text-gray-700">
            
            {/* Favoritos */}
            <div className="flex items-center cursor-pointer hover:text-red-600 transition">
              <Heart size={20} className="mr-1" />
              <div className="text-sm hidden sm:block">
                <span>Favoritos</span>
                <span className="ml-1 text-red-600 font-bold">(1)</span> 
              </div>
            </div>
            
            {/* Carrito */}
            <div className="flex items-center cursor-pointer hover:text-red-600 transition">
              <ShoppingCart size={20} className="mr-1" />
              <div className="text-sm hidden sm:block">
                <span>Carrito</span>
                <span className="ml-1 text-red-600 font-bold">(0)</span>
              </div>
            </div>
            
            {/* Cuenta/Login */}
            {user ? (
               // ARREGLO AQUÍ: Usamos un contenedor relativo con padding para el menú
               <div className="relative flex items-center gap-2 group cursor-pointer h-10">
                 <User size={20} className="text-red-600" />
                 <span className="text-sm font-bold text-gray-800 select-none">Hola, {user.nombre}</span>
                 
                 {/* MENÚ DESPLEGABLE
                     pt-4: Crea un puente invisible para que el mouse no se caiga.
                     min-w-[150px]: Le da un ancho mínimo para que no se vea aplastado.
                 */}
                 <div className="absolute top-full right-0 pt-4 hidden group-hover:block z-50 min-w-[150px]">
                    <div className="bg-white shadow-xl rounded-lg p-2 border border-gray-100 flex flex-col gap-1">
                        <div className="px-2 py-1 text-xs text-gray-400 border-b mb-1 uppercase tracking-wider">
                          Mi Cuenta
                        </div>
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-md transition-colors font-medium"
                        >
                          Cerrar Sesión
                        </button>
                    </div>
                 </div>
               </div>
            ) : (
              <div 
                onClick={() => setAuthModal('login')}
                className="flex items-center cursor-pointer hover:text-red-600 transition"
              >
                <User size={20} className="mr-1" />
                <span className="text-sm">Ingresar</span>
              </div>
            )}

          </div>
        </div>

        {/* ➡️ SECCIÓN DE NAVEGACIÓN INFERIOR */}
        <nav className="p-3 max-w-7xl mx-auto flex items-center space-x-8 text-sm text-gray-700 font-medium overflow-x-auto">
          
          <div className="flex items-center cursor-pointer hover:text-red-600 transition whitespace-nowrap">
              Categorías 
              <ChevronDown size={16} className="ml-1" />
          </div>

          {['Inicio', 'Blog', 'About Us', 'Contactanos'].map((item) => (
            <Link key={item} href="#" className="hover:text-red-600 transition whitespace-nowrap">
              {item}
            </Link>
          ))}
          
          <div className="ml-auto text-red-600 font-semibold flex items-center whitespace-nowrap">
              📞 +591 66800011
          </div>
        </nav>
      </header>

      {/* --- MODALES --- */}
      <Modal 
        isOpen={authModal === 'login'} 
        onClose={closeAuth} 
        title="Iniciar Sesión"
      >
        <LoginForm 
          onSuccess={() => { closeAuth(); window.location.reload(); }} 
          onSwitchToRegister={() => setAuthModal('register')} 
        />
      </Modal>

      <Modal 
        isOpen={authModal === 'register'} 
        onClose={closeAuth} 
        title="Crear Cuenta"
      >
        <RegisterForm 
          onSuccess={() => setAuthModal('login')} 
          onSwitchToLogin={() => setAuthModal('login')} 
        />
      </Modal>
    </>
  );
};

export default Header;