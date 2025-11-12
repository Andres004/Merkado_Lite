// mklite_frontend/app/page.tsx

import { features } from 'process';
import OfferBanner from './components/OfferBanner'; 
import ServicesSection from './components/ServicesSection';
import CategoriesSection from './components/CategoriesSection';
import ProductGrid from './components/ProductGrid';

export default function HomePage() {
  return (
    <main>
      <OfferBanner />
      <ServicesSection />
      <CategoriesSection />
      <ProductGrid title="Novedades" />
      <ProductGrid title="Más Vendidos" />
      {/* ⬅️ Aquí irán los demás componentes: Servicios, Categorías, Productos... */}
    </main>
  );
} 