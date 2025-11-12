// mklite_frontend/app/components/ProductGrid.tsx

import React from 'react';
import ProductCard from './ProductCard'; 
import { ArrowRight } from 'lucide-react';

// Datos de Muestra (MOCK DATA)
// NOTA: Debes reemplazar esto con la llamada a la API en el futuro
const mockProducts = [
  // Asegúrate de tener imágenes de prueba en /public para estas rutas
  { id: 1, name: "Nuggets Dino Sofia", image: "/images/nuggets.jpg", price: 64.80, oldPrice: 72.00, discount: 10, unit: "1 kg" },
  { id: 2, name: "Naranja", image: "/images/naranja.jpg", price: 7.50, unit: "1 kg" },
  { id: 3, name: "Lechuga Crespa", image: "/images/lechuga.jpg", price: 9.00, unit: "1 kg" },
  { id: 4, name: "Leche Pil Deslactosada", image: "/images/leche.jpg", price: 9.90, oldPrice: 12.50, unit: "800 ml" },
  { id: 5, name: "Alimento Podium Cat", image: "/images/catfood.jpg", price: 41.00, unit: "900 gr" },
  { id: 6, name: "Papa Holandesa", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 7, name: "Detergente Todo Brillo", image: "/images/detergente.jpg", price: 39.90, unit: "1.8 kg" },
  { id: 8, name: "Galleta Chips Ahoy", image: "/images/chipsahoy.jpg", price: 25.50, unit: "222 gr" },
];


const ProductGrid: React.FC<{ title: string }> = ({ title }) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Encabezado de la Parrilla */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            {title}
          </h2>
          {/* Enlace "Ver todo" */}
          <a href="#" className="flex items-center text-red-600 hover:text-red-700 font-semibold transition">
            Ver todo
            <ArrowRight size={16} className="ml-1" />
          </a>
        </div>

        {/* La Cuadrícula de Productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;