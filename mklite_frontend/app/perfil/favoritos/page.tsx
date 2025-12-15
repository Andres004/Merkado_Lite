'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ShoppingCart, Trash2 } from 'lucide-react';

import ConfirmModal from '../../components/admin/users/ConfirmModal';
import { FavoriteModel } from '../../models/favorite.model';
import { UserModel } from '../../models/user.model';
import { addToCartService } from '../../services/cart.service';
import { getMyFavorites, removeFavorite } from '../../services/favorite.service';
import { fetchCurrentUser } from '../../services/user.service';

export default function FavoritosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [favorites, setFavorites] = useState<FavoriteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<FavoriteModel | null>(null);
  const [removing, setRemoving] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const profile = await fetchCurrentUser();
        setUser(profile);

        const myFavorites = await getMyFavorites();
        setFavorites(myFavorites);
      } catch (error: any) {
        console.error('Error cargando favoritos', error);
        if (error?.response?.status === 401) {
          router.replace('/login');
          return;
        }
        setStatusMessage('No se pudieron cargar tus favoritos. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const availability = (favorite: FavoriteModel) => {
    const stock = favorite.product.inventory?.stock_disponible;
    const isAvailable = stock === undefined || stock > 0;
    return {
      available: isAvailable,
      label: isAvailable ? 'Disponible' : 'Agotado',
    };
  };

  
  const handleAddToCart = async (favorite: FavoriteModel) => {
    const userId = user?.id_usuario;

    if (!userId) {
        router.push('/login');
        return;
    }

    setAddingToCartId(favorite.id_producto);
    try {
        await addToCartService({
        id_usuario: userId, // ✅ ahora es number seguro
        id_producto: favorite.id_producto,
        cantidad: 1,
        });
        setStatusMessage(`${favorite.product.nombre} añadido al carrito.`);
    } catch (error: any) {
        const msg = error?.response?.data?.message || 'No se pudo añadir al carrito.';
        setStatusMessage(msg);
    } finally {
        setAddingToCartId(null);
    }
    };

  const handleRemoveFavorite = async () => {
    if (!confirmTarget) return;

    setRemoving(true);
    try {
      await removeFavorite(confirmTarget.id_producto);
      setFavorites((prev) => prev.filter((fav) => fav.id_producto !== confirmTarget.id_producto));
      setStatusMessage(`${confirmTarget.product.nombre} eliminado de favoritos.`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'No se pudo eliminar el favorito.';
      setStatusMessage(msg);
    } finally {
      setRemoving(false);
      setConfirmTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-red-600" size={32} />
        <span className="ml-2 text-gray-700">Cargando tus favoritos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Mi Cuenta</p>
          <h1 className="text-2xl font-bold text-gray-900">Favoritos</h1>
          <p className="text-gray-600">Guarda tus productos preferidos y agrégalos al carrito cuando quieras.</p>
        </div>
        {user && (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Cliente</p>
            <p className="text-sm font-semibold text-gray-800">{user.nombre} {user.apellido}</p>
            {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
        )}
      </header>

      {statusMessage && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800">Aún no tienes productos en favoritos.</p>
          <p className="text-gray-600 mt-2">Descubre nuestras ofertas y guarda tus productos preferidos.</p>
          <Link
            href="/productos"
            className="inline-flex mt-4 px-5 py-2 bg-[#F40009] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {favorites.map((favorite) => {
                const { available, label } = availability(favorite);
                return (
                  <tr key={`${favorite.id_usuario}-${favorite.id_producto}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={favorite.product.imagen_url || '/images/placeholder.jpg'}
                            alt={favorite.product.nombre}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{favorite.product.nombre}</p>
                          <p className="text-sm text-gray-500">ID: {favorite.id_producto}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-gray-800 font-semibold">
                        
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAddToCart(favorite)}
                          disabled={!available || addingToCartId === favorite.id_producto}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                            available
                              ? 'bg-[#F40009] text-white hover:bg-red-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } ${addingToCartId === favorite.id_producto ? 'opacity-80' : ''}`}
                        >
                          {addingToCartId === favorite.id_producto ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ShoppingCart size={16} />
                          )}
                          Añadir al carrito
                        </button>
                        <button
                          onClick={() => setConfirmTarget(favorite)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmTarget}
        title="Eliminar de favoritos"
        description={
          confirmTarget
            ? `¿Seguro que deseas eliminar "${confirmTarget.product.nombre}" de tus favoritos?`
            : '¿Eliminar este producto de favoritos?'
        }
        confirmLabel="Sí, eliminar"
        onConfirm={handleRemoveFavorite}
        onCancel={() => setConfirmTarget(null)}
        loading={removing}
      />
    </div>
  );
}