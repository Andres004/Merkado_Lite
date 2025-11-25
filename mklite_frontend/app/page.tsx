"use client"; 

import React, { useEffect, useState } from 'react';
import OfferBanner from './components/OfferBanner'; 
import ServicesSection from './components/ServicesSection';
import CategoriesSection from './components/CategoriesSection';
import ProductGrid from './components/ProductGrid';

// importacion el servicio y modelo
import { getAllProducts } from './services/product.service';
import { ProductModel } from './models/product.model';

export default function HomePage() {
  const [products, setProducts] = useState<ProductModel[]>([]);

  useEffect(() => {
    // Función para cargar datos reales
    const fetchData = async () => {
      const data = await getAllProducts();
      setProducts(data);
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <OfferBanner />
      <ServicesSection />
      <CategoriesSection />

      <ProductGrid 
        title="Novedades" 
        products={products.slice(0, 6)} 
      />
      
      <ProductGrid 
        title="Más Vendidos" 
        products={products.slice(4, 8)} 
      />
    </main>
  );
}