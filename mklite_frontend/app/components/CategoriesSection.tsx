// mklite_frontend/app/components/CategoriesSection.tsx

import React from 'react';

// Importamos los iconos necesarios para las categorías
import { 
  Carrot, Utensils, Drumstick, Wheat, 
  BottleWine, Popcorn, Milk, Home, 
  Droplet, Baby, Snowflake, PawPrint, ArrowRight 
} from 'lucide-react'; 

// Datos de las categorías y sus iconos
const categoriesData = [
  { name: "Frutas y Verduras", icon: Carrot },
  { name: "Fiambres y Embutidos", icon: Utensils },
  { name: "Carnes", icon: Drumstick },
  { name: "Panadería", icon: Wheat },
  { name: "Bebidas", icon: BottleWine },
  { name: "Snacks", icon: Popcorn },
  { name: "Lácteos", icon: Milk },
  { name: "Cuidado del Hogar", icon: Home },
  { name: "Cuidado Personal", icon: Droplet },
  { name: "Cuidado del Bebé", icon: Baby },
  { name: "Congelados", icon: Snowflake },
  { name: "Mascotas", icon: PawPrint },
];

const CategoriesSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Encabezado de la Sección */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Categorías
          </h2>
          {/* Enlace "Ver todo" */}
          <a href="#" className="flex items-center text-red-600 hover:text-red-700 font-semibold transition">
            Ver todo
            <ArrowRight size={16} className="ml-1" />
          </a>
        </div>

        {/* Cuadrícula de Categorías (Grid de 6x2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          
          {categoriesData.map((category, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:shadow-lg transition duration-300 cursor-pointer h-32 bg-white"
            >
              {/* Contenedor del Icono */}
              <div className="p-3 mb-2">
                <category.icon size={32} className="text-gray-700" />
              </div>

              {/* Nombre de la Categoría */}
              <p className="text-sm text-center font-medium text-gray-700">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;