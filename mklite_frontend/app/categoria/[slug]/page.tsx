"use client";

import React, { useEffect, useState, use } from 'react';
import { Home, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import ProductSidebar from '../../components/ProductSidebar';
import { getProductsByCategoryId } from '../../services/product.service';
import { ProductModel, CategoryModel } from '../../models/product.model';
import { getAllCategories } from '../../services/category.service';
import { matchCategoryBySlug } from '../../utils/slugify';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [category, setCategory] = useState<CategoryModel | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // 1. Cargar Categorías
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

  // 2. Buscar categoría por slug y cargar productos
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

  // --- Renderizado de Carga ---
  if (loadingCategories) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-4 bg-[#F40009] rounded-full mb-2 animate-bounce"></div>
            Cargando...
        </div>
      </div>
    );
  }

  // --- Renderizado No Encontrado ---
  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categoría no encontrada</h1>
        <p className="text-gray-500 mb-6">No pudimos encontrar "{slug}".</p>
        <Link href="/" className="bg-[#F40009] text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // --- Renderizado Principal ---
  return (
    <main className="bg-white min-h-screen pb-16">
      
      {/* 1. HEADER LIMPIO (Fondo Gris Claro) */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
            
            {/* Breadcrumbs (Rutas) */}
            <nav className="flex items-center text-sm text-gray-500 mb-4">
                <Link href="/" className="hover:text-[#F40009] transition-colors flex items-center text-gray-500">
                    <Home size={16} className="mr-2" /> Inicio
                </Link>
                
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                
                {/* CAMBIO AQUÍ: Ahora 'Categorías' es un Link */}
                <Link href="/categorias" className="hover:text-[#F40009] transition-colors text-gray-500">
                    Categorías
                </Link>
                
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                
                {/* Nombre de la categoría actual (Texto Rojo estático) */}
                <span className="font-bold !text-[#F40009]" style={{ color: '#F40009' }}>
                    {category.nombre}
                </span>
            </nav>

            {/* Título Estético */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 
                        className="text-4xl md:text-5xl font-extrabold tracking-tight !text-[#F40009]" 
                        style={{ color: '#F40009' }}
                    >
                        {category.nombre}
                    </h1>
                    <p className="text-gray-500 mt-3 text-lg font-light">
                        Explora nuestra selección fresca de {category.nombre.toLowerCase()}.
                    </p>
                </div>
                
                {/* Badge de Cantidad */}
                <div className="bg-white border border-gray-200 px-5 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 flex items-center mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#F40009] mr-2 animate-pulse"></span>
                    {loading ? "..." : products.length} productos
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 2. SIDEBAR */}
          <aside className="w-full lg:w-1/4 hidden lg:block sticky top-24 h-fit">
            <ProductSidebar />
          </aside>

          {/* 3. CONTENIDO PRINCIPAL */}
          <div className="w-full lg:w-3/4">
            
            {/* Barra de Herramientas */}
            <div className="flex justify-between items-center mb-8 bg-white p-2 rounded-xl">
               <span className="text-sm font-semibold text-gray-500 hidden sm:block">
                  Mostrando resultados
               </span>
               <div className="flex gap-2 ml-auto">
                   <button className="flex items-center text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-all">
                      <SlidersHorizontal size={16} className="mr-2 text-[#F40009]" />
                      Filtrar
                   </button>
               </div>
            </div>

            {/* Grid de Productos */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-50 h-72 rounded-2xl animate-pulse border border-gray-100"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-lg font-medium">No hay productos disponibles en esta categoría aún.</p>
                <Link href="/" className="text-[#F40009] font-bold mt-2 hover:underline inline-block">
                    Ver otras categorías
                </Link>
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