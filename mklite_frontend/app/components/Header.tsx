'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { getCartByUserService } from '../services/cart.service';
import { getAllCategories } from '../services/category.service';
//import { slugify } from '../utils/slugify';

const Header = () => {
  const router = useRouter();
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<{ id_categoria: number; nombre: string }[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  const fetchCartCount = async () => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      try {
        const cart = await getCartByUserService(parsedUser.id_usuario);
        if (cart && cart.cartItems) {
          const totalItems = cart.cartItems.reduce((acc: number, item: any) => acc + item.cantidad, 0);
          setCartCount(totalItems);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error cargando carrito header', error);
        setCartCount(0);
      }
    } else {
      setUser(null);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const closeAuth = () => setAuthModal(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setCartCount(0);
    window.location.href = '/';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleFavoritesClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/perfil/favoritos');
    } else {
      router.push('/login');
    }
  };

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Contáctanos', href: '/contacto' },
  ];

  return (
    <>
      <header className="bg-white shadow-md relative z-40">
        <div className="flex items-center justify-between p-3 max-w-7xl mx-auto border-b border-gray-100">
          <Link href="/" className="text-2xl font-extrabold text-red-600 cursor-pointer">
            MERKADO LITE
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg mx-12 flex items-center border border-gray-300 rounded-lg overflow-hidden h-10"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="¿Qué estás buscando hoy?"
              className="w-full p-2 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-gray-700 hover:bg-gray-800 text-white w-14 h-full flex items-center justify-center transition duration-150"
            >
              <Search size={20} />
            </button>
          </form>

          <div className="flex items-center space-x-6 text-gray-700">
            <button
              onClick={handleFavoritesClick}
              className="flex items-center cursor-pointer hover:text-red-600 transition"
            >
              <Heart size={20} className="mr-1" />
              <span className="text-sm hidden sm:block">Favoritos</span>
            </button>

            <Link href="/carrito" className="flex items-center cursor-pointer hover:text-red-600 transition">
              <ShoppingCart size={20} className="mr-1" />
              <div className="text-sm hidden sm:block">
                <span>Carrito</span>
                <span className="ml-1 text-red-600 font-bold">({cartCount})</span>
              </div>
            </Link>

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
              <button
                onClick={() => setAuthModal('login')}
                className="flex items-center cursor-pointer hover:text-red-600 transition"
              >
                <User size={20} className="mr-1" />
                <span className="text-sm">Ingresar</span>
              </button>
            )}
          </div>
        </div>

        <nav className="p-3 max-w-7xl mx-auto flex items-center space-x-8 text-sm text-gray-700 font-medium overflow-x-auto relative">
          <div
            className="flex items-center cursor-pointer hover:text-red-600 transition whitespace-nowrap relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
            onClick={() => setShowCategories((prev) => !prev)}
          >
            Categorías
            <ChevronDown size={16} className="ml-1" />

            {showCategories && (
              <div className="absolute top-8 left-0 bg-white shadow-xl border border-gray-100 rounded-lg py-2 w-60 z-50">
                {categories.length === 0 ? (
                  <p className="px-4 py-2 text-gray-500 text-sm">Cargando categorías...</p>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category.id_categoria}
                      
                      href={`/categoria/${category.id_categoria}`}
                      className="block px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600"
                    >
                      {category.nombre}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {navLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-red-600 transition whitespace-nowrap">
              {item.label}
            </Link>
          ))}
          <div className="ml-auto text-red-600 font-semibold flex items-center whitespace-nowrap">📞 +591 66800011</div>
        </nav>
      </header>

      <Modal isOpen={authModal === 'login'} onClose={closeAuth} title="Iniciar Sesión">
        <LoginForm
          onSuccess={() => {
            closeAuth();
            window.location.reload();
          }}
          onSwitchToRegister={() => setAuthModal('register')}
        />
      </Modal>

      <Modal isOpen={authModal === 'register'} onClose={closeAuth} title="Crear Cuenta">
        <RegisterForm onSuccess={() => setAuthModal('login')} onSwitchToLogin={() => setAuthModal('login')} />
      </Modal>
    </>
  );
};

export default Header;