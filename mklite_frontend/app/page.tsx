// mklite_frontend/app/page.tsx

import { features } from 'process';
import OfferBanner from './components/OfferBanner'; 
import ServicesSection from './components/ServicesSection';
import CategoriesSection from './components/CategoriesSection';

export default function HomePage() {
  return (
    <main>
      <OfferBanner />
      <ServicesSection />
      <CategoriesSection />
      {/* ⬅️ Aquí irán los demás componentes: Servicios, Categorías, Productos... */}
    </main>
  );
} 