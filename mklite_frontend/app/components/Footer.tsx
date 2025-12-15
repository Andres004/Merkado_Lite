"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Importamos iconos de redes sociales y flechas de lucide-react
import { Facebook, Twitter, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsLoggedIn(!!token);
  }, []);

  const accountLink = (path: string) => (isLoggedIn ? path : '/login');

  return (
    <footer>
      {/* ➡️ SECCIÓN 1: SUSCRIPCIÓN Y REDES SOCIALES (Fondo Blanco) */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* Texto de Suscripción */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              ¡No te pierdas nada!
            </h3>
            <p className="text-gray-500 text-sm">
              Suscríbete para que no se te escapen las mejores ofertas de nuestros productos.
            </p>
          </div>

          {/* Formulario de Suscripción y Botones de Redes */}
          <div className="flex items-center flex-wrap gap-4">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="border border-gray-300 p-3 rounded-md w-72 focus:ring-red-500 focus:border-red-500"
            />
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-md transition duration-150">
              Suscribirme
            </button>

            {/* Iconos de Redes Sociales */}
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-600 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-600 transition">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-600 transition">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ➡️ SECCIÓN 2: FOOTER OSCURO DE ENLACES */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-gray-700 pb-10">

            {/* Columna 1: Info General */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-2xl font-bold text-red-600 mb-4">MERKADO LITE</h4>
              <p className="text-sm text-gray-400 mb-4">
                En MERKADO LITE seleccionamos productos frescos y de calidad para llevarlos directo a tu puerta. Hacemos tu mercado más fácil para que disfrutes tu tiempo. Pide hoy, paga al recibir.
              </p>
              <p className="text-sm text-gray-400">
                +591 66800011
                <br/>
                merkadolite@gmail.com
              </p>
            </div>

            {/* Columna 2: Mi Cuenta */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Mi Cuenta</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={accountLink('/perfil')} className="hover:text-red-400">Mi Perfil</Link></li>
                <li><Link href={accountLink('/perfil/pedidos')} className="hover:text-red-400">Historial de pedidos</Link></li>
                <li><Link href="/carrito" className="hover:text-red-400">Carrito</Link></li>
                <li><Link href={accountLink('/perfil/favoritos')} className="hover:text-red-400">Favoritos</Link></li>
                <li><Link href={accountLink('/perfil/direcciones')} className="hover:text-red-400">Direcciones</Link></li>
              </ul>
            </div>

            {/* Columna 3: Soporte */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ayuda" className="hover:text-red-400">Ayuda / Soporte</Link></li>
                <li><Link href="/terminos" className="hover:text-red-400">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-red-400">Política de Privacidad</Link></li>
              </ul>
            </div>

            {/* Columna 4: Contáctanos */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contáctanos</h4>
              <p className="text-sm text-gray-400 space-y-2">
                <span className='block'>merkadolite@gmail.com</span>
                <span className='block'>+591 66800011</span>
                <span className='block'>Horarios de Atención</span>
              </p>
            </div>

            {/* Columna 5: Categorías */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-red-400">Inicio</Link></li>
                <li><Link href="/categorias" className="hover:text-red-400">Categorías</Link></li>
                <li><Link href="/" className="hover:text-red-400">Productos</Link></li>
                <li><Link href={accountLink('/perfil')} className="hover:text-red-400">Mi cuenta</Link></li>
              </ul>
            </div>
          </div>

          {/* Barra inferior de Copyright y Pagos */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 text-sm text-gray-500">
            <span>Merkado Lite ECommerce © 2025. Todos los derechos reservados</span>

            <div className="flex items-center space-x-4">
              <span className="text-xs">Muy Pronto:</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs">Pago Seguro</span>
            </div>

            {/* Controles de Slider de la parte inferior */}
            <div className='flex space-x-2'>
                 <button className='bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition'><ChevronLeft size={16} /></button>
                 <button className='bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition'><ChevronRight size={16} /></button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;