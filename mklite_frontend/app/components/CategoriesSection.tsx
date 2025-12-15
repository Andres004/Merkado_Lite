"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CategoryModel } from '../models/product.model';
import { getAllCategories } from '../services/category.service';
import { getCategoryIcon } from '../utils/categoryIcons';

const CategoriesSection = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado de la Sección */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Categorías
          </h2>
          {/* Enlace "Ver todo" */}
          <Link href="/categorias" className="flex items-center text-red-600 hover:text-red-700 font-semibold transition">
            Ver todo
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Cuadrícula de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {loading ? (
            [...Array(12)].map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
              />
            ))
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-sm col-span-full">No hay categorías disponibles en este momento.</p>
          ) : (
            categories.map((category) => {
              const Icon = getCategoryIcon(category.nombre) ?? ShoppingBag;

              return (
                <Link
                  key={category.id_categoria}
                  href={`/categoria/${category.id_categoria}`}
                  className="group flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:shadow-xl transition duration-300 cursor-pointer h-32 bg-white hover:bg-[#F40009] hover:border-[#F40009]"
                >
                  {/* Contenedor del Icono */}
                  <div className="p-3 mb-2">
                    <Icon size={32} className="text-gray-700 transition duration-300 group-hover:text-white" />
                  </div>

                  {/* Nombre de la Categoría */}
                  <p className="text-sm text-center font-medium text-gray-700 transition duration-300 group-hover:text-white">
                    {category.nombre}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;