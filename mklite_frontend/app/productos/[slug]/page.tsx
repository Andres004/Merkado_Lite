// mklite_frontend/app/productos/[slug]/page.tsx

import React from 'react';
import Image from 'next/image';
import { Home, Minus, Plus, Heart, Truck, CheckCircle } from 'lucide-react';

// MOCK DATA para el Producto (simulando lo que vendrá de la API)
const mockProduct = {
  id: 1,
  name: "Nuggets Dino Sofia 1 kg",
  slug: "nuggets-dino-sofia-1kg",
  sku: "2,51,684",
  image: "/images/canasta-ofertas.jpg", // Asegúrate de tener esta imagen en /public/images
  price: 64.80,
  oldPrice: 72.00,
  discount: 10,
  brand: "Sofia",
  description: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec, ultrices et ipsum. Nulla varius magna a consequat pulvinar.",
  stockStatus: "En stock",
  details: {
    peso: "1 Kg",
    tipo: "Congelado",
    categoria: "Congelados",
    estadoStock: "Disponible",
    tags: ["Congelado", "Pollo", "Comida Rápida", "Apanado", "Nuggets"]
  }
};

// MOCK DATA para Productos Relacionados (reutilizando la estructura de la ProductCard)
const relatedProducts = [
  { id: 2, name: "Nuggets Dino Sofia 1 kg", image: "/images/banner-frutasyverduras.png", price: 64.80, oldPrice: 72.00, discount: 10, unit: "1 kg" },
  { id: 3, name: "Nuggets Dino Sofia 1 kg", image: "/images/nuggets.jpg", price: 64.80, oldPrice: 72.00, discount: 10, unit: "1 kg" },
  { id: 4, name: "Nuggets Dino Sofia 1 kg", image: "/images/nuggets.jpg", price: 64.80, oldPrice: 72.00, discount: 10, unit: "1 kg" },
  { id: 5, name: "Nuggets Dino Sofia 1 kg", image: "/images/nuggets.jpg", price: 64.80, oldPrice: 72.00, discount: 10, unit: "1 kg" },
];

// Importamos ProductCard para los productos relacionados
import ProductCard from '../../components/ProductCard';


export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = mockProduct; // Usamos mock data por ahora

  return (
    <div className="bg-gray-50 pb-16">
      
      {/* ➡️ BANNER / BREADCRUMBS (Ajustado al diseño de producto individual) */}
      <div className="bg-gray-100 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-2 text-sm text-gray-500">
            <Home size={16} className="text-gray-400" />
            <a href="#" className="hover:text-red-500">Categorías</a>
            <span>/</span>
            <a href="#" className="hover:text-red-500">{product.details.categoria}</a> {/* Categoría del producto */}
            <span>/</span>
            <span className="font-semibold text-gray-800">{product.name}</span> {/* Nombre del producto */}
        </div>
      </div>

      {/* ➡️ SECCIÓN PRINCIPAL: IMAGEN, INFO Y DETALLES */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md">
          
          {/* Columna Izquierda: Imagen */}
          <div className="relative h-[450px] flex items-center justify-center">
            <Image
              src={product.image}
              alt={product.name}
              width={400} 
              height={400} 
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Columna Derecha: Información de Compra */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-800">{product.name}</h1>
            
            {/* SKU y Stock */}
            <div className="flex items-center space-x-4 text-sm">
                <p className="text-gray-500">SKU: {product.sku}</p>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {product.stockStatus}
                </span>
            </div>

            {/* Precios y Descuento */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <span className="text-2xl font-bold text-gray-800">Bs. {product.price.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">Bs. {product.oldPrice.toFixed(2)}</span>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                    {product.discount}%
                </span>
            </div>

            {/* Descripción */}
            <p className="text-gray-600">{product.description}</p>
            
            {/* Marca (Placeholder simple) */}
            <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-500'>Marca:</span>
                <span className='font-semibold text-gray-800'>{product.brand}</span>
            </div>


            {/* Cantidad, Botón de Carrito y Favoritos */}
            <div className="flex items-center space-x-4 pt-4">
              {/* Selector de Cantidad */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button className="p-3 hover:bg-gray-100 rounded-l-md"><Minus size={18} /></button>
                <span className="px-4 py-2 font-semibold text-lg">1</span>
                <button className="p-3 hover:bg-gray-100 rounded-r-md"><Plus size={18} /></button>
              </div>

              {/* Botón Añadir al Carrito */}
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md shadow-md transition duration-150 flex items-center justify-center space-x-2">
                Añadir al Carrito
              </button>

              {/* Botón de Favoritos */}
              <button className="p-3 border border-gray-300 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ➡️ INFORMACIÓN ADICIONAL Y DETALLES */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* TABS (por simplicidad, mostramos solo la sección de Información Adicional) */}
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Información Adicional</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 text-sm">
            {/* Usamos un grid para el layout de los detalles */}
            <p className="font-semibold text-gray-600">Peso:</p>
            <p className="col-span-2 text-gray-800">{product.details.peso}</p>
            
            <p className="font-semibold text-gray-600">Tipo:</p>
            <p className="col-span-2 text-gray-800">{product.details.tipo}</p>
            
            <p className="font-semibold text-gray-600">Categoría:</p>
            <p className="col-span-2 text-gray-800">{product.details.categoria}</p>

            <p className="font-semibold text-gray-600">Estado de Stock:</p>
            <p className="col-span-2 text-gray-800">{product.details.estadoStock}</p>
            
            <p className="font-semibold text-gray-600">Tags:</p>
            <p className="col-span-2 text-gray-800">
                {product.details.tags.map(tag => (
                    <span key={tag} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full mr-2 mb-1">{tag}</span>
                ))}
            </p>
          </div>
        </div>
      </div>
      
      {/* ➡️ PRODUCTOS RELACIONADOS */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Productos relacionados</h2>
        
        {/* Usamos el mismo grid de la página de inicio */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {relatedProducts.map(relatedProduct => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}