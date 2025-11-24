import React from 'react';
import Image from 'next/image';
import { Plus, ShoppingCart } from 'lucide-react';
import { ProductModel } from '../models/product.model';


const ProductCard = ({ product }: { product: ProductModel }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full group">
      
      {/* Imagen */}
      <div className="relative h-40 w-full bg-gray-100 p-4">
        <Image
         
          src={product.imagen_url || '/images/placeholder.jpg'} 
          alt={product.nombre} 
          fill
          style={{ objectFit: 'contain' }}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge de Oferta (si hay descuento) */}
        {/* <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
           OFERTA
        </div> */}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2" title={product.nombre}>
            {product.nombre}
          </h3>

          <p className="text-xs text-gray-500 mb-2">{product.descripcion?.substring(0, 30)}...</p>
        </div>

        
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            
            <span className="text-lg font-bold text-gray-900">Bs. {product.precio_venta}</span>
          </div>
          
          <button 
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-sm"
            title="Agregar al carrito"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;