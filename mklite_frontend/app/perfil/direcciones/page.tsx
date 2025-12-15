'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Edit3, MapPin, Star, Trash2 } from 'lucide-react';
import { Address } from '../../types/address';
import { fetchCurrentUser } from '../../services/user.service';
import { UserModel } from '../../models/user.model';

const emptyForm: Omit<Address, 'id'> = {
  label: '',
  addressLine: '',
  extraDetails: '',
  phone: '',
  isDefault: false,
};

export default function MisDireccionesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const storageKey = useMemo(
    () => `addresses_${user?.id_usuario ?? 'guest'}`,
    [user?.id_usuario]
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadUser = async () => {
      try {
        const profile = await fetchCurrentUser();
        setUser(profile);
      } catch (error) {
        console.error('Error obteniendo el usuario', error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Address[];
        setAddresses(parsed);
      } catch (error) {
        console.error('No se pudieron cargar las direcciones guardadas', error);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, storageKey]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.label.trim() || !form.addressLine.trim() || !form.phone.trim()) {
      setStatus('Completa los campos obligatorios antes de guardar.');
      return;
    }

    if (editingId) {
      const updated = addresses.map((address) =>
        address.id === editingId
          ? {
              ...address,
              label: form.label.trim(),
              addressLine: form.addressLine.trim(),
              extraDetails: form.extraDetails?.trim(),
              phone: form.phone.trim(),
              isDefault: form.isDefault,
            }
          : address
      );

      setAddresses(
        form.isDefault ? updated.map((addr) => ({ ...addr, isDefault: addr.id === editingId })) : updated
      );
      setStatus('Dirección actualizada correctamente.');
    } else {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const newAddress: Address = {
        id,
        label: form.label.trim(),
        addressLine: form.addressLine.trim(),
        extraDetails: form.extraDetails?.trim(),
        phone: form.phone.trim(),
        isDefault: form.isDefault || addresses.length === 0,
      };

      const normalized = newAddress.isDefault
        ? [newAddress, ...addresses.map((addr) => ({ ...addr, isDefault: false }))]
        : [...addresses, newAddress];

      setAddresses(normalized);
      setStatus('Dirección añadida con éxito.');
    }

    resetForm();
  };

  const handleEdit = (address: Address) => {
    setForm({
      label: address.label,
      addressLine: address.addressLine,
      extraDetails: address.extraDetails || '',
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((address) => address.id !== id);
    if (!updated.some((address) => address.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === id })));
  };

  if (loadingUser) {
    return <div>Cargando tus direcciones...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Mi Cuenta</p>
          <h1 className="text-2xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-600">
            Administra tus direcciones de entrega favoritas y marca una como predeterminada.
          </p>
        </div>
        {user && (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Cliente</p>
            <p className="text-sm font-semibold text-gray-800">{user.nombre} {user.apellido}</p>
            {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
        )}
      </header>

      <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="text-red-600" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Añadir nueva dirección</h2>
            <p className="text-sm text-gray-600">
              Completa los campos para guardar un punto de entrega. Puedes actualizarlo en cualquier momento.
            </p>
          </div>
        </div>

        {status && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Etiqueta *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ej: Casa, Oficina"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Teléfono *</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Número de contacto"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Dirección de entrega *</label>
            <input
              type="text"
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              placeholder="Ej: Calle, número, zona"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Indicaciones adicionales (Opcional)</label>
            <textarea
              value={form.extraDetails}
              onChange={(e) => setForm({ ...form, extraDetails: e.target.value })}
              placeholder="Ej: Casa puerta negra, dejar en la portería"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="isDefault"
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Marcar como dirección predeterminada
            </label>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2 text-white font-semibold shadow hover:bg-red-700 transition-colors"
            >
              {editingId ? 'Actualizar Dirección' : 'Guardar Dirección'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Direcciones guardadas</h2>
            <p className="text-sm text-gray-600">Administra, edita o elimina tus ubicaciones de entrega.</p>
          </div>
          <span className="text-sm text-gray-500">{addresses.length} guardadas</span>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            Aún no has guardado direcciones. Completa el formulario para añadir tu primera ubicación.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`relative rounded-xl border p-5 shadow-sm bg-white transition hover:shadow-md ${
                  address.isDefault ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-red-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Etiqueta</p>
                      <h3 className="text-lg font-semibold text-gray-900">{address.label}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(address)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 size={16} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-gray-800">{address.addressLine}</p>
                  {address.extraDetails && <p className="text-gray-600">{address.extraDetails}</p>}
                  <p className="text-gray-700">Tel: {address.phone}</p>
                </div>

                {address.isDefault ? (
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <Star size={14} /> Predeterminado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Star size={14} /> Marcar como Predeterminado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}