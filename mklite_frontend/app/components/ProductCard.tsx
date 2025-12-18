'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { ProductModel } from '../models/product.model';
import { useFavorites } from '../context/FavoriteContext';
import { useRouter } from 'next/navigation';

const ProductCard = ({ product }: { product: ProductModel }) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites();
  const favorite = isFavorite(product.id_producto);
  // -------------------------------------------------------
  // LÓGICA DE DESCUENTO (Adaptada a tu BD actual)
  // -------------------------------------------------------
  // Como tu base de datos actual (MySQL) aún no tiene campos de "oferta",
  // he dejado esta lógica preparada. Si en el futuro agregas 'precio_antiguo'
  // a tu tabla, descomenta y ajusta esto.
  
  const oldPrice = undefined; // product.precio_antiguo (Si existiera en BD)
  const discountPercent = 0;  // Calculo automático si tuvieras oldPrice
  const isDiscounted = false; // Cambiar a: oldPrice && oldPrice > product.precio_venta;
  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await toggleFavorite(product);
  };

  const handleGoToDetail = () => {
    const hasSession = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!hasSession) {
      router.push('/login');
      return;
    }

    router.push(`/producto/${product.id_producto}`);
  };



  return (
    <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-lg group transition duration-300 relative overflow-hidden flex flex-col h-full hover:shadow-xl">
      
      {/* 1. ETIQUETA DE DESCUENTO (Solo se muestra si hay descuento) */}
      {isDiscounted && (
        <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-20">
          -{discountPercent}%
        </span>
      )}

      {/* 2. ICONOS DE INTERACCIÓN (Hover) */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-x-4 group-hover:translate-x-0">
        <button
            onClick={handleFavoriteClick}
            className={`bg-white p-2 rounded-full shadow-md transition-colors ${favorite ? 'text-red-600 hover:bg-red-100' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
            title="Añadir a favoritos"
            aria-pressed={favorite}
        >
          
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <Link 
            href={`/productos/${product.id_producto}`}
            className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Ver detalles"
        >
          <Eye size={18} />
        </Link>
      </div>

      {/* IMAGEN DEL PRODUCTO (Con Link al detalle) */}
      <div className="relative h-40 w-full mb-4 flex items-center justify-center bg-gray-50 rounded-md p-2">
        <Link href={`/productos/${product.id_producto}`} className="w-full h-full relative">
            

            <Image 
              src={product.imagen_url || '/images/placeholder.jpg'} 
              alt={product.nombre || "Imagen del producto"} 
              
              fill
              style={{ objectFit: 'contain' }}
              className="group-hover:scale-105 transition-transform duration-300"
              unoptimized={true}
            />
        </Link>
      </div>

      {/*  INFORMACIÓN DEL PRODUCTO */}
      <div className="flex flex-col flex-grow justify-between">
        
        {/* Nombre y Descripción */}
        <div>
            {/* Link en el título también */}
            <Link href={`/productos/${product.id_producto}`}>
                <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 hover:text-red-600 transition-colors" title={product.nombre}>
                    {product.nombre}
                </h3>
            </Link>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.descripcion}
            </p>
        </div>
        
        {/* Precios y Botón */}
        <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-50">
          
          {/* Precios */}
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-900">
              Bs. {product.precio_venta}
            </span>
            {isDiscounted && oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                Bs. {oldPrice}
              </span>
            )}
          </div>
          
          {/* BOTÓN VERDE */}
          
          <button
            onClick={handleGoToDetail}
            className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-full transition duration-200 shadow-md hover:shadow-lg active:scale-95"
            title="Agregar al carrito"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;