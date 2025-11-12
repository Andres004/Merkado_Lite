// mklite_frontend/app/components/ProductSidebar.tsx

import React from 'react';
import { ChevronUp } from 'lucide-react'; 

const categories = [
  "Frutas y Verduras", "Carnes", "Mascotas", "Panadería", 
  "Lácteos", "Cuidado del Hogar", "Cuidado Personal", "Bebidas", 
  "Cuidado del Bebé", "Fiambres y Embutidos", "Snacks","Congelados"
];

const ProductSidebar = () => {
  return (
    <div className="w-full bg-white p-4 sticky top-4 shadow-sm border border-gray-100 rounded-lg">
      
      {/* SECCIÓN CATEGORÍAS */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex justify-between items-center cursor-pointer mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Categorías</h3>
          <ChevronUp size={18} className="text-gray-500" />
        </div>
        
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li key={index} className="flex items-center text-sm">
              {/* Usamos un radio button simple para el filtro (solo puede seleccionar uno) */}
              <input 
                type="radio" 
                id={`cat-${index}`} 
                name="categoryFilter" 
                className="mr-2 text-red-600 focus:ring-red-500"
                defaultChecked={category === "Frutas y Verduras"} // Marcamos una por defecto
              />
              <label htmlFor={`cat-${index}`} className="text-gray-700 cursor-pointer hover:text-red-600">
                {category}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* SECCIÓN PRECIO */}
      <div className="mb-4">
        <div className="flex justify-between items-center cursor-pointer mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Precio</h3>
          <ChevronUp size={18} className="text-gray-500" />
        </div>
        
        {/* Placeholder de Slider de Precio (Idealmente usar una librería como react-range-slider) */}
        <div className="mt-4">
          <input type="range" min="1" max="1000" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          <p className="text-sm text-gray-500 mt-2">Precio: Bs. 1 - Bs. 1000</p>
        </div>
      </div>

    </div>
  );
};

export default ProductSidebar;