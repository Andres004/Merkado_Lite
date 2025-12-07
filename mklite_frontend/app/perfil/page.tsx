'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <div>Cargando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center md:text-left">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA DE CONTACTO */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Información de Contacto</h3>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Nombre del Cliente</p>
            <p className="text-gray-700">{user.nombre} {user.apellido}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Correo Electrónico</p>
            <p className="text-gray-700">{user.email}</p>
          </div>

          <Link 
            href="/perfil/editar" 
            className="text-red-600 text-sm font-medium hover:underline"
          >
            Editar Perfil
          </Link>
        </div>

        {/* TARJETA DE DIRECCIÓN */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Dirección de Envío Principal</h3>
          
          <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">Datos:</p>
            <p className="text-gray-700">{user.nombre} {user.apellido}</p>
            <p className="text-gray-700">{user.direccion || 'Sin dirección registrada'}</p>
            <p className="text-gray-700">Tel: {user.telefono || 'Sin teléfono'}</p>
          </div>

          <Link 
            href="#" 
            className="text-red-600 text-sm font-medium hover:underline mt-4 inline-block"
          >
            Gestionar Direcciones
          </Link>
        </div>

      </div>
    </div>
  );
}