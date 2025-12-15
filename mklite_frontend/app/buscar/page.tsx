'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../services/product.service';
import { ProductModel } from '../models/product.model';

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      const data = await searchProducts(query);
      setProducts(data);
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  const handleNewSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const term = String(formData.get('q') || '').trim();
    if (!term) return;
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <section className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Buscar productos</h1>
          <form
            onSubmit={handleNewSearch}
            className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-12 max-w-3xl"
          >
            <input
              name="q"
              defaultValue={query}
              placeholder="Escribe el nombre o descripción"
              className="w-full px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#F40009] text-white h-full px-4 flex items-center gap-2 font-semibold"
            >
              <Search size={18} /> Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-8">
        {loading ? (
          <div className="text-gray-600">Buscando productos...</div>
        ) : !query.trim() ? (
          <div className="text-gray-600">Ingresa un término para buscar productos.</div>
        ) : products.length === 0 ? (
          <div className="text-gray-600">No se encontraron productos para "{query}".</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id_producto} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchPage;