import React from 'react';
import Link from 'next/link';

const AyudaPage = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Ayuda y Soporte</h1>
      <p className="text-gray-700 leading-relaxed">
        ¿Tienes preguntas sobre tus pedidos, envíos o tu cuenta? Estamos aquí para ayudarte.
        Revisa nuestras preguntas frecuentes o contáctanos para recibir soporte personalizado.
      </p>
      <div className="space-y-2 text-gray-700">
        <p>Correo: <a className="text-red-600 hover:underline" href="mailto:merkadolite@gmail.com">merkadolite@gmail.com</a></p>
        <p>Teléfono: <a className="text-red-600 hover:underline" href="tel:+59166800011">+591 66800011</a></p>
      </div>
      <Link href="/contacto" className="inline-flex px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
        Ir a contacto
      </Link>
    </main>
  );
};

export default AyudaPage;
