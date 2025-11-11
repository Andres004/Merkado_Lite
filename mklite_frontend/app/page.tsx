// mklite_frontend/app/page.tsx

import { features } from 'process';
import OfferBanner from './components/OfferBanner'; 
import ServicesSection from './components/ServicesSection';

export default function HomePage() {
  return (
    <main>
      <OfferBanner />
      <ServicesSection />
      {/* ⬅️ Aquí irán los demás componentes: Servicios, Categorías, Productos... */}
    </main>
  );
} 