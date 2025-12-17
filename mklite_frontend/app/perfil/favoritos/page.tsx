'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  Loader2, 
  ShoppingCart, 
  Trash2, 
  Heart, 
  PackageSearch, 
  ArrowRight 
} from 'lucide-react';

import ConfirmModal from '../../components/admin/users/ConfirmModal';
import { FavoriteModel } from '../../models/favorite.model';
import { UserModel } from '../../models/user.model';
import { addToCartService } from '../../services/cart.service';
import { getMyFavorites, removeFavorite } from '../../services/favorite.service';
import { fetchCurrentUser } from '../../services/user.service';

// Función auxiliar para formatear moneda
const formatCurrency = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 'Bs. 0.00';
  return `Bs. ${numeric.toFixed(2)}`;
};

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
      className: isAvailable 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
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
        id_usuario: userId,
        id_producto: favorite.id_producto,
        cantidad: 1,
        });
        setStatusMessage(`${favorite.product.nombre} añadido al carrito.`);
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setStatusMessage(null), 3000);
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
      setTimeout(() => setStatusMessage(null), 3000);
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 bg-[#F40009] rounded-full animate-bounce mb-4"></div>
        <p className="text-gray-400 font-medium">Cargando tus favoritos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-[#F40009] rounded-xl shadow-sm border border-red-100">
                <Heart size={32} className="fill-current" />
            </div>
            <div>
                {/* TÍTULO EN ROJO (#F40009) BLINDADO */}
                <h1 className="text-3xl font-extrabold text-[#F40009]" style={{ color: '#F40009' }}>
                    Favoritos
                </h1>
                <p className="text-gray-500 mt-1">
                    Guarda tus productos preferidos y agrégalos al carrito cuando quieras.
                </p>
            </div>
        </div>

        {user && (
          <div className="hidden md:block text-right">
             <span className="inline-block px-4 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Cliente
             </span>
             <p className="text-sm font-bold text-gray-900">{user.nombre} {user.apellido}</p>
          </div>
        )}
      </div>

      {/* --- ALERTAS --- */}
      {statusMessage && (
        <div className="animate-fade-in flex items-center gap-3 bg-white border-l-4 border-[#F40009] px-4 py-3 shadow-md rounded-r-lg">
          <AlertCircle size={20} className="text-[#F40009]" />
          <span className="text-gray-700 font-medium text-sm">{statusMessage}</span>
        </div>
      )}

      {/* --- CONTENIDO --- */}
      {favorites.length === 0 ? (
        // Estado Vacío con diseño mejorado
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
             <PackageSearch size={40} />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
             Aún no tienes favoritos
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
             Parece que no has guardado nada todavía. Explora nuestras categorías y dale corazón a lo que más te guste.
          </p>
          <Link
            href="/categorias" // REDIRECCIÓN ARREGLADA A CATEGORÍAS
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F40009] text-white rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-105 transition-all"
          >
            Explorar Categorías
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        // Tabla de Favoritos
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider hidden md:table-cell">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {favorites.map((favorite) => {
                  const { available, label, className } = availability(favorite);
                  // Precio simulado si no viene en el modelo, ajustar según tu backend
                  const precio = favorite.product.precio_venta || 0; 

                  return (
                    <tr key={`${favorite.id_usuario}-${favorite.id_producto}`} className="group hover:bg-red-50/10 transition-colors">
                      
                      {/* Producto */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:border-red-100 transition-colors shrink-0">
                            <Image
                              src={favorite.product.imagen_url || '/images/placeholder.jpg'}
                              alt={favorite.product.nombre}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#F40009] transition-colors">
                                {favorite.product.nombre}
                            </p>
                            <div className="sm:hidden mt-1 font-bold text-[#F40009]">
                                {formatCurrency(precio)}
                            </div>
                            <div className="md:hidden mt-1">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${className}`}>
                                    {label}
                                </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Precio (Desktop) */}
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                         <span className="text-lg font-bold text-gray-900">
                             {formatCurrency(precio)}
                         </span>
                      </td>

                      {/* Estado (Desktop) */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${className}`}>
                          {label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Botón Añadir al Carrito */}
                          <button
                            onClick={() => handleAddToCart(favorite)}
                            disabled={!available || addingToCartId === favorite.id_producto}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm
                                ${available 
                                    ? 'bg-[#F40009] text-white hover:bg-red-800 hover:shadow-red-100' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                            `}
                          >
                            {addingToCartId === favorite.id_producto ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <ShoppingCart size={18} />
                            )}
                            <span className="hidden sm:inline">Añadir</span>
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => setConfirmTarget(favorite)}
                            className="p-2 rounded-lg text-gray-400 hover:text-[#F40009] hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            title="Eliminar de favoritos"
                          >
                            <Trash2 size={20} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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