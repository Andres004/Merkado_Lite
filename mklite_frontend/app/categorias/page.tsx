"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryModel } from '../models/product.model';
import { getAllCategories } from '../services/category.service';
import { getCategoryIcon } from '../utils/categoryIcons';
import { ShoppingBag } from 'lucide-react';

const CategoriesPage = () => {
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
    <main className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-black text-white py-12 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold">Todas las categorías</h1>
          <p className="text-gray-300 mt-2">Explora los productos disponibles por categoría.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="h-32 rounded-lg bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No encontramos categorías por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.nombre) ?? ShoppingBag;

              return (
                <Link
                  key={category.id_categoria}
                  href={`/categoria/${category.id_categoria}`}
                  className="group bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:border-red-500 hover:shadow-lg transition"
                >
                  <div className="p-3 mb-3 rounded-full bg-gray-50 group-hover:bg-red-50">
                    <Icon size={32} className="text-gray-700 group-hover:text-red-600" />
                  </div>
                  <p className="font-semibold text-gray-800 text-center group-hover:text-red-600">
                    {category.nombre}
                  </p>
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