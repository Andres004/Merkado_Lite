'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic'; // Importante para el mapa
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, Edit3, MapPin, Star, Trash2, Plus, Navigation, Locate 
} from 'lucide-react';
import { Address } from '../../types/address';
import { fetchCurrentUser } from '../../services/user.service';
import { UserModel } from '../../models/user.model';

// Importamos el mapa dinámicamente para evitar errores de ventana (SSR)
const MapSelector = dynamic(() => import('../../components/MapSelector'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  )
});

// Extendemos tu tipo Address para incluir coordenadas
interface AddressWithCoords extends Address {
  lat?: number;
  lng?: number;
}

const emptyForm: Omit<AddressWithCoords, 'id'> = {
  label: '',
  addressLine: '',
  extraDetails: '',
  phone: '',
  isDefault: false,
  lat: undefined,
  lng: undefined,
};

export default function MisDireccionesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [addresses, setAddresses] = useState<AddressWithCoords[]>([]);
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
        setAddresses(JSON.parse(saved));
      } catch (error) { console.error(error); }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || loadingUser) return;
    localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, storageKey, loadingUser]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setStatus(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.label.trim() || !form.addressLine.trim() || !form.phone.trim()) {
      setStatus('Por favor completa los campos obligatorios (*).');
      return;
    }

    // Validación opcional de mapa
    if (!form.lat || !form.lng) {
        // Podrías hacerlo obligatorio si quisieras
        // setStatus('Por favor selecciona una ubicación en el mapa.');
        // return;
    }

    if (editingId) {
      const updated = addresses.map((address) =>
        address.id === editingId ? { ...address, ...form } : address
      );
      setAddresses(form.isDefault ? updated.map((addr) => ({ ...addr, isDefault: addr.id === editingId })) : updated);
      setStatus('¡Dirección actualizada correctamente!');
    } else {
      const id = Date.now().toString();
      const newAddress = { ...form, id, isDefault: form.isDefault || addresses.length === 0 };
      const normalized = newAddress.isDefault
        ? [newAddress, ...addresses.map((addr) => ({ ...addr, isDefault: false }))]
        : [...addresses, newAddress];
      setAddresses(normalized);
      setStatus('¡Dirección añadida con éxito!');
    }
    resetForm();
    setTimeout(() => setStatus(null), 3000);
  };

  const handleEdit = (address: AddressWithCoords) => {
    setForm(address);
    setEditingId(address.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((address) => address.id !== id);
    if (!updated.some((address) => address.isDefault) && updated.length > 0) updated[0].isDefault = true;
    setAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === id })));
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-[#F40009] rounded-xl shadow-sm border border-red-100">
                <Navigation size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-[#F40009]" style={{ color: '#F40009' }}>
                    Mis Direcciones
                </h1>
                <p className="text-gray-500 mt-1">Administra tus lugares de entrega frecuentes.</p>
            </div>
        </div>
        {user && (
          <div className="hidden md:block text-right">
             <span className="inline-block px-4 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cliente</span>
             <p className="text-sm font-bold text-gray-900">{user.nombre} {user.apellido}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-red-50 p-2 rounded-lg text-[#F40009]">
                        {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h2>
                </div>

                {status && (
                    <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                        status.includes('éxito') || status.includes('correctamente') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        <CheckCircle2 size={16} />
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campos de Texto */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Etiqueta *</label>
                        <input
                            type="text"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            placeholder="Ej: Casa, Oficina"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#F40009] focus:ring-4 focus:ring-red-50 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono *</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="Celular de contacto"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#F40009] focus:ring-4 focus:ring-red-50 transition-all outline-none"
                        />
                    </div>

                    {/* MAPA INTEGRADO */}
                    <div>
                        <label className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <span>Ubicación *</span>
                            {form.lat && <span className="text-[#F40009] text-[10px]">Ubicación seleccionada ✓</span>}
                        </label>
                        <MapSelector 
                            onLocationSelect={(lat, lng) => setForm({ ...form, lat, lng })}
                            initialPos={form.lat && form.lng ? [form.lat, form.lng] : undefined}
                        />
                         <p className="text-[10px] text-gray-400 mt-1 text-center">
                            {form.lat ? `Coordenadas: ${form.lat.toFixed(4)}, ${form.lng?.toFixed(4)}` : 'Toca en el mapa para fijar tu ubicación'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección Escrita *</label>
                        <input
                            type="text"
                            value={form.addressLine}
                            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                            placeholder="Calle, número, zona"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#F40009] focus:ring-4 focus:ring-red-50 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Detalles</label>
                        <textarea
                            value={form.extraDetails}
                            onChange={(e) => setForm({ ...form, extraDetails: e.target.value })}
                            placeholder="Ej: Portón negro, dejar en recepción"
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-[#F40009] focus:ring-4 focus:ring-red-50 transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            id="isDefault" type="checkbox" checked={form.isDefault}
                            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                            className="h-5 w-5 rounded border-gray-300 text-[#F40009] focus:ring-[#F40009]"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">Usar como principal</label>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <button type="submit" className="w-full rounded-xl bg-[#F40009] px-6 py-3 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all">
                            {editingId ? 'Actualizar Dirección' : 'Guardar Dirección'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className="w-full rounded-xl border border-gray-200 px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* LISTA DE DIRECCIONES */}
        <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-gray-900">Mis Ubicaciones</h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{addresses.length} guardadas</span>
             </div>

             {addresses.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <MapPin size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">No tienes direcciones guardadas.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className={`relative group p-5 rounded-2xl border transition-all duration-300 bg-white ${address.isDefault ? 'border-[#F40009] shadow-md shadow-red-50 ring-1 ring-red-100' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-red-200'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${address.isDefault ? 'bg-[#F40009] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-[#F40009] transition-colors'}`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 leading-tight">{address.label}</h4>
                                        {address.isDefault && <span className="text-[10px] font-bold text-[#F40009] uppercase tracking-wide">Principal</span>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(address)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(address.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 mb-4 pl-1">
                                <p className="line-clamp-2 min-h-[2.5em]">{address.addressLine}</p>
                                {address.lat && <p className="text-xs text-blue-600 flex items-center gap-1"><Locate size={12}/> Ubicación fijada en mapa</p>}
                                <p className="pt-2 font-medium text-gray-800 flex items-center gap-1"><span className="text-gray-400">Tel:</span> {address.phone}</p>
                            </div>
                            {!address.isDefault && (
                                <button onClick={() => handleSetDefault(address.id)} className="w-full py-2 rounded-lg text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                                    <Star size={14} /> Marcar como principal
                                </button>
                            )}
                        </div>
                    ))}
                </div>
             )}
        </div>
      </div>
    </div>
  );
}