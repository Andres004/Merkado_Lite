"use client"; 

import React from 'react';
import Link from 'next/link'; 
import { ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react'; 
import { useCart } from '../context/CartContext'; 

const Header = () => {
  const { cartCount } = useCart(); 

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      
      {/* SECCIÓN SUPERIOR */}
      <div className="flex items-center justify-between p-3 max-w-7xl mx-auto border-b border-gray-100">
        
        {/* LOGO (Ahora es un Link al inicio) */}
        <Link href="/" className="text-2xl font-extrabold text-red-600 cursor-pointer hover:scale-105 transition-transform">
          MERKADO LITE
        </Link>
        
        {/* BUSCADOR CENTRAL */}
        <div className="hidden md:flex flex-1 max-w-lg mx-12 items-center border border-gray-300 rounded-lg overflow-hidden h-10 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
          <input 
            type="text" 
            placeholder="¿Qué estás buscando hoy?" 
            className="w-full p-2 focus:outline-none text-sm"
          />
          <button className="bg-gray-800 hover:bg-red-600 text-white w-14 h-full flex items-center justify-center transition duration-150">
            <Search size={20} />
          </button>
        </div>
        
        {/* ICONOS DE USUARIO Y CARRITO */}
        <div className="flex items-center space-x-6 text-gray-700">
          
          {/* Favoritos (Estático por ahora) */}
          <div className="hidden sm:flex items-center cursor-pointer hover:text-red-600 transition group">
            <Heart size={22} className="mr-1 group-hover:fill-red-100" />
            <div className="text-sm flex flex-col leading-tight">
              <span className="font-bold text-xs text-gray-400 group-hover:text-red-400">Favoritos</span>
              <span className="font-bold">Lista</span> 
            </div>
          </div>
          
          {/* CUENTA / LOGIN (Link a /user) */}
          <Link href="/user" className="flex items-center cursor-pointer hover:text-red-600 transition group">
            <User size={22} className="mr-1" />
            <div className="text-sm flex flex-col leading-tight">
               <span className="font-bold text-xs text-gray-400 group-hover:text-red-400">Hola,</span>
               <span className="font-bold">Ingresa</span>
            </div>
          </Link>
          
          {/* CARRITO (Conectado al Contexto) */}
          <Link href="/carrito" className="flex items-center cursor-pointer hover:text-red-600 transition relative">
            <div className="relative">
                <ShoppingCart size={24} />
                {/* Globo Rojo con el número real */}
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-short">
                        {cartCount}
                    </span>
                )}
            </div>
            <div className="text-sm ml-2 hidden sm:block">
              <span className="font-bold text-xs text-gray-400">Tu</span>
              <div className="font-bold leading-tight">Carrito</div>
            </div>
          </Link>
          
        </div>
      </div>

      {/* SECCIÓN DE NAVEGACIÓN INFERIOR */}
      <nav className="p-3 max-w-7xl mx-auto flex items-center space-x-8 text-sm text-gray-700 font-medium overflow-x-auto">
        
        {/* Categorías */}
        <div className="flex items-center cursor-pointer hover:text-red-600 transition whitespace-nowrap">
            Categorías 
            <ChevronDown size={16} className="ml-1" />
        </div>

        {/* Enlaces Simples (Convertidos a Link) */}
        <Link href="/" className="hover:text-red-600 transition whitespace-nowrap">Inicio</Link>
        <Link href="#" className="hover:text-red-600 transition whitespace-nowrap">Blog</Link>
        <Link href="#" className="hover:text-red-600 transition whitespace-nowrap">Nosotros</Link>
        <Link href="#" className="hover:text-red-600 transition whitespace-nowrap">Contacto</Link>
        
        {/* Teléfono a la derecha */}
        <div className="ml-auto text-red-600 font-semibold flex items-center whitespace-nowrap">
            📞 <span className="hidden sm:inline ml-1">+591 66800011</span>
        </div>
      </nav>
    </header>
  );
};

export default Header;