"use client"; // ⬅️ Necesario para saber en qué URL estamos

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook para saber la URL actual
import { ChevronUp, CheckCircle2 } from 'lucide-react'; 

// Lista de Categorías con sus Slugs (URLs) correctos
// Deben coincidir con los que definimos en tu mapa de categorías
const categories = [
  { name: "Frutas y Verduras", slug: "frutas-y-verduras" },
  { name: "Carnes", slug: "carnes" },
  { name: "Lácteos", slug: "lacteos" },
  { name: "Bebidas", slug: "bebidas" },
  { name: "Snacks", slug: "snacks" },
  { name: "Mascotas", slug: "mascotas" },
  { name: "Panadería", slug: "panaderia" },
  { name: "Cuidado del Hogar", slug: "cuidado-del-hogar" },
  { name: "Cuidado Personal", slug: "cuidado-personal" },
  { name: "Congelados", slug: "congelados" },
  { name: "Cuidado del Bebé", slug: "cuidado-del-bebe" },
  { name: "Fiambres y Embutidos", slug: "fiambres-y-embutidos" },
];

const ProductSidebar = () => {
  const pathname = usePathname(); // Obtenemos la URL actual (ej: /categoria/bebidas)

  return (
    <div className="w-full bg-white p-5 sticky top-4 shadow-sm border border-gray-100 rounded-xl">
      
      {/* SECCIÓN CATEGORÍAS */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Categorías</h3>
          <ChevronUp size={18} className="text-gray-400" />
        </div>
        
        <ul className="space-y-1">
          {categories.map((cat, index) => {
            // Verificamos si esta es la categoría activa
            const isActive = pathname.includes(`/categoria/${cat.slug}`);

            return (
              <li key={index}>
                <Link 
                  href={`/categoria/${cat.slug}`}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${isActive 
                        ? 'bg-red-50 text-[#F40009] font-bold shadow-sm' // Estilo Activo (Rojo Coca-Cola)
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' // Estilo Normal
                    }
                  `}
                >
                  <span>{cat.name}</span>
                  
                  {/* Si está activo, mostramos un pequeño check o círculo */}
                  {isActive && <CheckCircle2 size={16} className="text-[#F40009]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SECCIÓN PRECIO (Visual por ahora) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Precio</h3>
          <ChevronUp size={18} className="text-gray-400" />
        </div>
        
        <div className="mt-2 px-2">
          {/* Barra roja estilo Coca-Cola */}
          <input 
            type="range" 
            min="1" 
            max="1000" 
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F40009]" 
          />
          <div className="flex justify-between mt-3 text-sm font-medium text-gray-600">
             <span>Bs. 1</span>
             <span>Bs. 1000</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductSidebar;