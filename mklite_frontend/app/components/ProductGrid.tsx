import React from 'react';
import ProductCard from './ProductCard'; 
import { ArrowRight } from 'lucide-react';
import { ProductModel } from '../models/product.model';

// Definimos la interfaz de lo que este componente VA A RECIBIR
interface ProductGridProps {
  title: string;
  products: ProductModel[]; 
}

const ProductGrid: React.FC<ProductGridProps> = ({ title, products }) => {
  
  if (!products || products.length === 0) {
     return (
        <section className="py-12 bg-white text-center">
            <p className="text-gray-400">No hay productos disponibles en esta sección.</p>
        </section>
     );
  }

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
          {products.map((product) => (
            <ProductCard key={product.id_producto} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;