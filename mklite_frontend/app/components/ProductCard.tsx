// mklite_frontend/app/components/ProductCard.tsx

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, ArrowRight } from 'lucide-react'; 

// Definimos la estructura de datos para un producto (idealmente, esto vendría de app/models/)
interface Product {
  id: number;
  name: string;
  image: string; // Ruta de la imagen en /public
  price: number;
  oldPrice?: number; // Precio anterior para descuentos
  discount?: number;
  unit: string;
}

// Componente
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const isDiscounted = product.discount && product.discount > 0;
  
  return (
    <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-lg group transition duration-300 relative overflow-hidden">
      
      {/* Etiqueta de Descuento (ej. 10%) */}
      {isDiscounted && (
        <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
          {product.discount}%
        </span>
      )}

      {/* Iconos de Interacción (Corazón y Ojo) - Se muestran al pasar el ratón */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-red-600">
          <Heart size={18} />
        </button>
        <button className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-red-600">
          <Eye size={18} />
        </button>
      </div>

      {/* Imagen del Producto */}
      <div className="relative h-40 w-full mb-3 flex items-center justify-center">
        <Image 
          src={product.image} 
          alt={product.name} 
          width={150} // Ajusta el tamaño según sea necesario
          height={150} 
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Información del Producto */}
      <p className="text-sm font-medium mb-1 truncate">{product.name} {product.unit}</p>
      
      <div className="flex items-end justify-between">
        {/* Precios */}
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-800">
            Bs. {product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-gray-500 line-through">
              Bs. {product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Botón de Carrito */}
        <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition duration-150 shadow-md">
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;