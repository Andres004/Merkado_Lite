// mklite_frontend/app/components/Header.tsx

import React from 'react';
// Importamos iconos para Carrito, Corazón (Favoritos), Usuario y Búsqueda
// Nota: Si no usas lucide-react, reemplaza con la librería de iconos que use tu equipo.
import { ShoppingCart, Heart, User, Search, ChevronDown } from 'lucide-react'; 

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      {/* ➡️ SECCIÓN SUPERIOR: Logo, Buscador, Iconos de Usuario */}
      <div className="flex items-center justify-between p-3 max-w-7xl mx-auto border-b border-gray-100">
        
        {/* LOGO */}
        <div className="text-2xl font-extrabold text-red-600 cursor-pointer">
          MERKADO LITE
        </div>
        
        {/* BUSCADOR CENTRAL */}
        <div className="flex-1 max-w-lg mx-12 flex items-center border border-gray-300 rounded-lg overflow-hidden h-10">
          <input 
            type="text" 
            placeholder="¿Qué estás buscando hoy?" 
            className="w-full p-2 focus:outline-none text-sm"
          />
          {/* Botón de Buscar */}
          <button className="bg-gray-700 hover:bg-gray-800 text-white w-14 h-full flex items-center justify-center transition duration-150">
            <Search size={20} />
          </button>
        </div>
        
        {/* ICONOS DE USUARIO Y CARRITO */}
        <div className="flex items-center space-x-6 text-gray-700">
          
          {/* Favoritos */}
          <div className="flex items-center cursor-pointer hover:text-red-600 transition">
            <Heart size={20} className="mr-1" />
            <div className="text-sm">
              <span>Favoritos</span>
              <span className="ml-1 text-red-600 font-bold">(1)</span> 
            </div>
          </div>
          
          {/* Carrito */}
          <div className="flex items-center cursor-pointer hover:text-red-600 transition">
            <ShoppingCart size={20} className="mr-1" />
            <div className="text-sm">
              <span>Carrito</span>
              <span className="ml-1 text-red-600 font-bold">(0)</span>
            </div>
          </div>
          
          {/* Cuenta/Login */}
          <div className="flex items-center cursor-pointer hover:text-red-600 transition">
            <User size={20} className="mr-1" />
            <span className="text-sm">Cuenta</span>
          </div>
        </div>
      </div>

      {/* ➡️ SECCIÓN DE NAVEGACIÓN INFERIOR: Enlaces y Teléfono */}
      <nav className="p-3 max-w-7xl mx-auto flex items-center space-x-8 text-sm text-gray-700 font-medium">
        
        {/* Enlace con Submenú (Categorías) */}
        <div className="flex items-center cursor-pointer hover:text-red-600 transition">
            Categorías 
            <ChevronDown size={16} className="ml-1" />
        </div>

        {/* Enlaces Simples */}
        {['Inicio', 'Blog', 'About Us', 'Contactanos'].map((item) => (
          <a key={item} href="#" className="hover:text-red-600 transition">
            {item}
          </a>
        ))}
        
        {/* Teléfono a la derecha */}
        <div className="ml-auto text-red-600 font-semibold flex items-center">
            📞 +591 66800011
        </div>
      </nav>
    </header>
  );
};

export default Header;