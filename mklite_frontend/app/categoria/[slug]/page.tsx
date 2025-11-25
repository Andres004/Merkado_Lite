"use client";

// 1. IMPORTAMOS 'use' DE REACT
import React, { useEffect, useState, use } from 'react';
import { Home, ChevronRight, Filter } from 'lucide-react'; 
import ProductCard from '../../components/ProductCard'; 
import ProductSidebar from '../../components/ProductSidebar'; 
import { getProductsByCategoryId } from '../../services/product.service';
import { ProductModel } from '../../models/product.model';

// MAPA DE CATEGORÍAS
const CATEGORY_MAP: Record<string, { id: number; title: string; description: string }> = {
  'frutas-y-verduras':  { id: 1, title: 'Frutas y Verduras', description: 'Lo más fresco del campo a tu mesa.' },
  'carnes':             { id: 10, title: 'Carnes y Embutidos', description: 'Cortes de primera calidad.' },
  'lacteos':            { id: 3, title: 'Lácteos y Huevos', description: 'Esenciales para tu desayuno.' },
  'bebidas':            { id: 4, title: 'Bebidas y Refrescos', description: 'Refresca tu día.' },
  'snacks':             { id: 9, title: 'Snacks', description: 'Antojos y snacks para disfrutar.' },
  'mascotas':           { id: 6, title: 'Mascotas', description: 'Lo mejor para tus amigos peludos.' },
  'panaderia':          { id: 7, title: 'Panadería', description: 'Pan fresco y horneados deliciosos.' },
  'cuidado-del-hogar':  { id: 5, title: 'Cuidado del Hogar', description: 'Manten tu espacio sano.' },
  'cuidado-personal':   { id: 11, title: 'Cuidado Personal', description: 'Area de cuidado integral.' },
  'congelados':         { id: 8, title: 'Congelados', description: 'Soluciones rápidas y ricas.' },
  'cuidado-del-bebe':   { id: 12, title: 'Cuidado del Bebé', description: 'Cuidado del pequeño del hogar.' },
  'fiambres-y-embutidos': { id: 2, title: 'Fiambres y Embutidos', description: 'Comida de calidad.' },
};

// 2. CAMBIAMOS EL TIPO DE PARAMS A PROMISE
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // 3. DESEMPAQUETAMOS LOS PARAMS CON 'use()'
  const { slug } = use(params);
  
  const categoryConfig = CATEGORY_MAP[slug];

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (categoryConfig) {
        setLoading(true);
        const data = await getProductsByCategoryId(categoryConfig.id);
        setProducts(data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, categoryConfig]);

  // CASO ERROR
  if (!categoryConfig) {
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
      
      {/* HEADER / BREADCRUMBS ESTILO BANNER */}
      <div className="relative bg-black border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
            <div className="flex items-center text-lg text-gray-300">
                <a href="/" className="flex items-center hover:text-[#F40009] transition-colors">
                    <Home size={20} className="mr-2" />
                    Casa
                </a>
                <ChevronRight size={20} className="mx-3 text-gray-600" />
                <span className="hover:text-[#F40009] cursor-pointer transition-colors">
                    Categorías
                </span>
                <ChevronRight size={20} className="mx-3 text-gray-600" />
                <span className="font-bold text-[#F40009] tracking-wide">
                    {categoryConfig.title}
                </span>
            </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        <div className="flex flex-col lg:flex-row gap-8"> 

            {/* BARRA LATERAL (Sidebar) */}
            <aside className="w-full lg:w-1/4 hidden lg:block"> 
                <ProductSidebar />
            </aside>

            {/* COLUMNA DE CONTENIDO PRINCIPAL */}
            <div className="w-full lg:w-3/4"> 
                
                {/* Título y Descripción */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold !text-[#F40009] mb-2">
                        {categoryConfig.title}
                    </h1>
                    <p className="text-gray-600 max-w-2xl">
                        {categoryConfig.description}
                    </p>
                </div>

                {/* Barra de Herramientas */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">
                        Mostrando <span className="font-bold text-gray-800">{products.length}</span> productos
                    </p>
                    <button className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600">
                        <Filter size={18} className="mr-1" />
                        Filtrar
                    </button>
                </div>

                {/* GRID DE PRODUCTOS */}
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
                        {products.map(product => (
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