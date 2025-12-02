'use client';
import React, { useEffect, useState } from 'react';

export default function EditProfilePage() {
  const [user, setUser] = useState<any>({ nombre: '', email: '' });

  // Simulamos carga de datos
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Funcionalidad de actualizar perfil en construcción (Conectar con PUT /user/:id)');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Editar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Fila 1: Nombre y Correo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={user.nombre + ' ' + (user.apellido || '')} 
              disabled 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="text" 
              value={user.email} 
              disabled 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Sección Cambio de Contraseña */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Cambiar Contraseña</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <input 
              type="password" 
              placeholder="Introduce tu contraseña actual"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
            <a href="#" className="text-xs text-red-500 hover:underline mt-1 inline-block">
              ¿Olvidaste tu contraseña actual?
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="Crea una nueva contraseña"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input 
                type="password" 
                placeholder="Vuelve a escribir la contraseña"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md"
          >
            Guardar Cambios
          </button>
        </div>

      </form>
    </div>
  );
}