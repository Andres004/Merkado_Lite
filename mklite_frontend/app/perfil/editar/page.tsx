'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser, updateCurrentUser, changePassword } from '@/app/services/user.service';
import { UserModel } from '@/app/models/user.model';

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<UserModel>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadUser = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchCurrentUser();
        setForm({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          ci: data.ci,
          telefono: data.telefono,
          direccion: data.direccion,
        });
        localStorage.setItem('userData', JSON.stringify(data));
      } catch (err: any) {
        const message = err?.response?.data?.message || 'No pudimos cargar tu información.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateCurrentUser(form);
      setSuccess('Perfil actualizado correctamente.');
      localStorage.setItem('userData', JSON.stringify(updated));
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No pudimos actualizar tu perfil.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'No pudimos actualizar tu contraseña.';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Editar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && <div className="p-3 bg-green-50 text-green-700 rounded-md">{success}</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              type="text"
              value={form.nombre || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              name="apellido"
              type="text"
              value={form.apellido || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
            <input
              name="ci"
              type="text"
              value={form.ci || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              name="telefono"
              type="text"
              value={form.telefono || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              name="direccion"
              type="text"
              value={form.direccion || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-10 pt-4 border-t border-gray-200">
        <h3 className="font-bold text-gray-800">Cambiar Contraseña</h3>
        {passwordSuccess && <div className="p-3 bg-green-50 text-green-700 rounded-md">{passwordSuccess}</div>}
        {passwordError && <div className="p-3 bg-red-50 text-red-700 rounded-md">{passwordError}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <input
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md"
          >
            {passwordSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}