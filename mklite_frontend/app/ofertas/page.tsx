// mklite_frontend/app/ofertas/page.tsx

import ProductSidebar from '../components/ProductSidebar';
import ProductCard from '../components/ProductCard'; 
import { ChevronDown } from 'lucide-react';

// MOCK DATA para el listado (la misma lógica de la Home)
const mockProducts = [
  // Deberías llenar esto con más datos para que se vea como en tu diseño
  { id: 1, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 2, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 3, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 4, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 5, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  { id: 6, name: "Papa Holandesa 1 kg", image: "/images/papa.jpg", price: 13.00, unit: "1 kg" },
  // ... (Añadir más productos para que el grid se llene)
];

export default function OfertasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* RUTA DE NAVEGACIÓN (Breadcrumbs) - No visible en el diseño, pero es buena práctica */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-red-600">Inicio</a> / <span className="font-semibold text-gray-800">Ofertas de la Semana</span>
      </div>

      <div className="flex space-x-8">
        
        {/* Columna Izquierda: SIDEBAR DE FILTROS */}
        <aside className="w-1/4">
          <ProductSidebar />
        </aside>

        {/* Columna Derecha: LISTADO DE PRODUCTOS */}
        <section className="w-3/4">
          
          
          
          {/* CUADRÍCULA DE PRODUCTOS (Reutilizamos la lógica del grid) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Aquí iría la Paginación */}
        </section>

      </div>
    </div>
  );
}