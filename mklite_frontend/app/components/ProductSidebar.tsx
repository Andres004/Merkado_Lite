"use client"; // ⬅️ Necesario para saber en qué URL estamos

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook para saber la URL actual
import { ChevronUp, CheckCircle2 } from 'lucide-react';
import { CategoryModel } from '../models/product.model';
import { getAllCategories } from '../services/category.service';

const ProductSidebar = () => {
  const pathname = usePathname(); // Obtenemos la URL actual (ej: /categoria/5)
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const activeCategoryId = (() => {
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (!lastSegment) return null;
    const numericId = Number(lastSegment.split('-')[0]);
    return Number.isNaN(numericId) ? null : numericId;
  })();

  return (
    <div className="w-full bg-white p-5 sticky top-4 shadow-sm border border-gray-100 rounded-xl">

      {/* SECCIÓN CATEGORÍAS */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Categorías</h3>
          <ChevronUp size={18} className="text-gray-400" />
        </div>

        {loading ? (
          <ul className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <li key={index} className="h-4 bg-gray-100 rounded animate-pulse" />
            ))}
          </ul>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">No hay categorías disponibles.</p>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id_categoria;

              return (
                <li key={cat.id_categoria}>
                  <Link
                    href={`/categoria/${cat.id_categoria}`}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${isActive
                          ? 'bg-red-50 text-[#F40009] font-bold shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span>{cat.nombre}</span>

                    {/* Si está activo, mostramos un pequeño check o círculo */}
                    {isActive && <CheckCircle2 size={16} className="text-[#F40009]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
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