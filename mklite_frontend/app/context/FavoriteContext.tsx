'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { FavoriteModel } from '../models/favorite.model';
import { ProductModel } from '../models/product.model';
import { addFavorite, getMyFavorites, removeFavorite } from '../services/favorite.service';
import { useRouter } from 'next/navigation';

interface FavoriteContextValue {
  favorites: FavoriteModel[];
  isAuthenticated: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: ProductModel) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextValue | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteModel[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const detectAuth = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsAuthenticated(!!token);
    return !!token;
  }, []);

  const refreshFavorites = useCallback(async () => {
    const loggedIn = detectAuth();
    if (!loggedIn) {
      setFavorites([]);
      return;
    }

    try {
      const data = await getMyFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('No se pudieron cargar favoritos', error);
    }
  }, [detectAuth]);

  useEffect(() => {
    refreshFavorites();
    const onStorageChange = () => {
      detectAuth();
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [detectAuth, refreshFavorites]);

  const isFavorite = useCallback(
    (productId: number) => favorites.some((fav) => fav.id_producto === productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (product: ProductModel) => {
      const loggedIn = detectAuth();
      if (!loggedIn) {
        router.push('/login');
        return;
      }

      const alreadyFavorite = isFavorite(product.id_producto);
      try {
        if (alreadyFavorite) {
          await removeFavorite(product.id_producto);
          setFavorites((prev) => prev.filter((fav) => fav.id_producto !== product.id_producto));
        } else {
          const created = await addFavorite(product.id_producto);
          setFavorites((prev) => [...prev, created]);
        }
      } catch (error) {
        console.error('No se pudo actualizar favoritos', error);
      }
    },
    [detectAuth, isFavorite, router],
  );

  const value: FavoriteContextValue = {
    favorites,
    isAuthenticated,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoriteProvider');
  }
  return context;
};
