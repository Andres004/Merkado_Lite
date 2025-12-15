"use client";

import React, { useEffect, useState, use } from 'react';
import { Home, ChevronRight, Filter } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import ProductSidebar from '../../components/ProductSidebar';
import { getProductsByCategoryId } from '../../services/product.service';
import { ProductModel, CategoryModel } from '../../models/product.model';
import { getAllCategories } from '../../services/category.service';
import { matchCategoryBySlug } from '../../utils/slugify';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [category, setCategory] = useState<CategoryModel | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async (categoryId: number) => {
      setLoading(true);
      const data = await getProductsByCategoryId(categoryId);
      setProducts(data);
      setLoading(false);
    };

    if (!loadingCategories && categories.length > 0) {
      const matched = matchCategoryBySlug(categories, slug);
      setCategory(matched);
      if (matched) {
        fetchProducts(matched.id_categoria);
      } else {
        setLoading(false);
      }
    }
  }, [categories, loadingCategories, slug]);

  if (loadingCategories) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-600">
        Cargando categorías...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Categoría no encontrada</h1>
        <p className="text-gray-500 mb-6">Lo sentimos, no encontramos la categoría "{slug}".</p>
        <a href="/" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
          Volver al Inicio
        </a>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-12">
      <div className="relative bg-black border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center text-lg text-gray-300">
            <a href="/" className="flex items-center hover:text-[#F40009] transition-colors">
              <Home size={20} className="mr-2" />
              Casa
            </a>
            <ChevronRight size={20} className="mx-3 text-gray-600" />
            <span className="hover:text-[#F40009] cursor-pointer transition-colors">Categorías</span>
            <ChevronRight size={20} className="mx-3 text-gray-600" />
            <span className="font-bold text-[#F40009] tracking-wide">{category.nombre}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 hidden lg:block">
            <ProductSidebar />
          </aside>

          <div className="w-full lg:w-3/4">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold !text-[#F40009] mb-2">{category.nombre}</h1>
              <p className="text-gray-600 max-w-2xl">
                Explora los productos disponibles en la categoría {category.nombre}.
              </p>
            </div>

            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-bold text-gray-800">{products.length}</span> productos
              </p>
              <button className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600">
                <Filter size={18} className="mr-1" />
                Filtrar
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id_producto} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}