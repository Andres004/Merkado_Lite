
import React from 'react';
import Link from 'next/link';
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
  { name: "Panaderia", icon: Wheat },
  { name: "Bebidas", icon: BottleWine },
  { name: "Snacks", icon: Popcorn },
  { name: "Lacteos", icon: Milk },
  { name: "Cuidado del Hogar", icon: Home },
  { name: "Cuidado Personal", icon: Droplet },
  { name: "Cuidado del Bebe", icon: Baby },
  { name: "Congelados", icon: Snowflake },
  { name: "Mascotas", icon: PawPrint },
];

// Función para generar "slugs" a partir del nombre
const slugify = (text: string) =>
  text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

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

        {/* Cuadrícula de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categoriesData.map((category, index) => (
            <Link 
              key={index} 
              href={`/categoria/${slugify(category.name)}`}
            
              className="group flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:shadow-xl transition duration-300 cursor-pointer h-32 bg-white hover:bg-[#F40009] hover:border-[#F40009]"
            >
              {/* Contenedor del Icono */}
              <div className="p-3 mb-2">
               
                <category.icon size={32} className="text-gray-700 transition duration-300 group-hover:text-white" />
              </div>

              {/* Nombre de la Categoría */}
              <p className="text-sm text-center font-medium text-gray-700 transition duration-300 group-hover:text-white">
                
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;