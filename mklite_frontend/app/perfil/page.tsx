'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser } from '../services/user.service';
import { UserModel } from '../models/user.model';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCurrentUser();
        setUser(data);
        localStorage.setItem('userData', JSON.stringify(data));
      } catch (err: any) {
        const message = err?.response?.data?.message || 'No pudimos obtener tu perfil.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) return <div>Cargando perfil...</div>;

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!user) return null;

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

          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Cédula</p>
            <p className="text-gray-700">{user.ci || 'Sin CI registrada'}</p>
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