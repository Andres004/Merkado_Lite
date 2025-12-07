'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { getCartByUserService } from '../services/cart.service'; // Importamos el servicio

const Header = () => {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0); // Estado para el contador

  // Función para cargar el carrito
  const fetchCartCount = async () => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      try {
        const cart = await getCartByUserService(parsedUser.id_usuario);
        if (cart && cart.cartItems) {
          // Sumamos la cantidad de todos los items
          const totalItems = cart.cartItems.reduce((acc: number, item: any) => acc + item.cantidad, 0);
          setCartCount(totalItems);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error("Error cargando carrito header", error);
        setCartCount(0);
      }
    } else {
      setUser(null);
      setCartCount(0);
    }
  };

  // Cargar al inicio y escuchar eventos
  useEffect(() => {
    fetchCartCount();

    // Escuchar el evento "cartUpdated" que creamos en el servicio
    window.addEventListener('cartUpdated', fetchCartCount);
    
    // Limpieza
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  const closeAuth = () => setAuthModal(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setCartCount(0);
    window.location.href = '/'; // Recarga completa para limpiar estados
  };

  return (
    <>
      <header className="bg-white shadow-md relative z-40">
        {/* SECCION SUPERIOR */}
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
            
            {/* Carrito (CON LINK Y CONTADOR REAL) */}
            <Link href="/carrito" className="flex items-center cursor-pointer hover:text-red-600 transition">
              <ShoppingCart size={20} className="mr-1" />
              <div className="text-sm hidden sm:block">
                <span>Carrito</span>
                <span className="ml-1 text-red-600 font-bold">({cartCount})</span>
              </div>
            </Link>
            
            {/* Cuenta/Login */}
            {user ? (
               <div className="relative flex items-center gap-2 group cursor-pointer h-10">
                 <User size={20} className="text-red-600" />
                 <span className="text-sm font-bold text-gray-800 select-none">Hola, {user.nombre}</span>
                 
                 <div className="absolute top-full right-0 pt-4 hidden group-hover:block z-50 min-w-[150px]">
                    <div className="bg-white shadow-xl rounded-lg p-2 border border-gray-100 flex flex-col gap-1">
                        <Link 
                          href="/perfil"
                          className="w-full text-left px-2 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium block"
                        >
                          Mi Perfil
                        </Link>

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

        {/* NAVEGACIÓN INFERIOR */}
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

      {/* MODALES */}
      <Modal isOpen={authModal === 'login'} onClose={closeAuth} title="Iniciar Sesión">
        <LoginForm onSuccess={() => { closeAuth(); window.location.reload(); }} onSwitchToRegister={() => setAuthModal('register')} />
      </Modal>

      <Modal isOpen={authModal === 'register'} onClose={closeAuth} title="Crear Cuenta">
        <RegisterForm onSuccess={() => setAuthModal('login')} onSwitchToLogin={() => setAuthModal('login')} />
      </Modal>
    </>
  );
};

export default Header;