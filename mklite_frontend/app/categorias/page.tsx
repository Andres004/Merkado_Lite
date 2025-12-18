"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryModel } from '../models/product.model'; 
import { getAllCategories } from '../services/category.service'; 
import { getCategoryIcon } from '../utils/categoryIcons'; 
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error al cargar categorías", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <main className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <span className="text-red-600 font-bold tracking-wider text-sm uppercase mb-2 block">
          Nuestro Catálogo
        </span>
        
        {/* AQUÍ ESTÁ EL CAMBIO: Título Negro y Rojo */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight mb-6">
          <span className="text-red-600"> Explora por Categorías</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Encuentra rápidamente lo que buscas. Productos frescos y seleccionados para ti.
        </p>
      </div>

      {/* --- GRID DE CATEGORÍAS --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-40 bg-gray-50 rounded-xl border border-gray-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-gray-200 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Sin categorías</h3>
            <p className="text-gray-500">No hay categorías disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.nombre) ?? ShoppingBag;

              return (
                <Link
                  key={category.id_categoria}
                  href={`/categoria/${category.id_categoria}`}
                  className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.15)] hover:border-red-500 transition-all duration-300 flex flex-col items-center text-center"
                >
                  {/* Icono Flotante */}
                  <div className="mb-4 p-4 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  
                  {/* Nombre */}
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                    {category.nombre}
                  </h3>

                  {/* Flechita decorativa esquina superior derecha */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <ArrowUpRight size={20} className="text-red-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoriesPage;