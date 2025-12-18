'use client';

// mklite_frontend/app/ofertas/page.tsx

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ProductSidebar from '../components/ProductSidebar';
import ProductCard from '../components/ProductCard';
import { getOfferProducts } from '../services/product.service';
import { ProductModel } from '../models/product.model';

export default function OfertasPage() {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const offers = await getOfferProducts();
      setProducts(offers);
      setLoading(false);
    };

    fetchOffers();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center text-gray-500 py-10">Cargando ofertas...</div>
      );
    }

    if (!products.length) {
      return (
        <div className="col-span-full text-center text-gray-500 py-10 font-semibold">
          No hay ofertas disponibles por el momento
        </div>
      );
    }

    return products.map((product) => (
      <ProductCard key={product.id_producto} product={product} />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-red-600">Inicio</a>
        <ChevronDown size={14} className="text-gray-300 rotate-[-90deg]" />
        <span className="font-semibold text-gray-800">Ofertas</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <aside className="lg:w-1/4 mb-6 lg:mb-0">
          <ProductSidebar />
        </aside>

        <section className="lg:w-3/4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-gray-900">Ofertas destacadas</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {renderContent()}
          </div>
        </section>
      </div>
    </div>
  );
}