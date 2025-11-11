// mklite_frontend/app/components/OfferBanner.tsx

import React from 'react';
import Image from 'next/image';

const OfferBanner = () => {
  // 💡 NOTA: La ruta comienza con /images/ porque Next.js ignora el directorio 'public'.
  const imageUrl = '/images/canasta-ofertas.jpg'; 

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* ➡️ Columna Izquierda: Imagen (Canasta de Verduras) */}
        <div className="w-1/2 relative h-[450px]">
          <Image
            src={imageUrl}
            alt="Ofertas de la Semana - Canasta de Productos Frescos"
            fill // Usamos 'fill' para que ocupe todo el contenedor padre (relative h-[450px])
            style={{ objectFit: 'contain' }} // Asegura que la imagen completa sea visible
            priority // Para que cargue inmediatamente, es crucial para la interfaz
            sizes="(max-width: 768px) 100vw, 50vw" // Ayuda a la optimización
          />
        </div>

        {/* ➡️ Columna Derecha: Texto Promocional */}
        <div className="w-1/2 pl-12">
          <h1 className="text-6xl font-extrabold text-gray-800 leading-tight mb-4">
            ¡Ofertas de la semana!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Aprovecha estos increíbles descuentos antes de que se acaben.
          </p>
          
          {/* Botón de Ofertas */}
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg transition duration-150">
            Ver ofertas
          </button>
        </div>

      </div>
    </section>
  );
};

export default OfferBanner;