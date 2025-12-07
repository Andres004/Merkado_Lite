"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductModel } from '../models/product.model';
import { addItemToCartAPI, getMyCartAPI } from '../services/cart.service'; 


export interface CartItem extends ProductModel {
  cantidad: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductModel, qty: number) => void;
  removeFromCart: (productId: number) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        // Si hay usuario, deberíamos cargar del backend (lo dejamos pendiente para no complicar ahora)
        // Por ahora cargamos del localStorage para que no se pierda visualmente
        const saved = localStorage.getItem('shoppingCart');
        if (saved) setCartItems(JSON.parse(saved));
    } else {
        const saved = localStorage.getItem('shoppingCart');
        if (saved) setCartItems(JSON.parse(saved));
    }
  }, []);

  // CADA VEZ QUE CAMBIA EL CARRITO: Guardar en LocalStorage (Respaldo)
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // AÑADIR AL CARRITO
  const addToCart = async (product: ProductModel, qty: number) => {

    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id_producto === product.id_producto);
      if (existing) {
        return prevItems.map((i) =>
          i.id_producto === product.id_producto ? { ...i, cantidad: i.cantidad + qty } : i
        );
      } else {
        return [...prevItems, { ...product, cantidad: qty }];
      }
    });

    // Si el usuario está logueado, enviamos al Backend
    const userStr = localStorage.getItem('user'); 
    const user = userStr ? JSON.parse(userStr) : null;

    // Solo si tenemos un usuario válido con ID
    if (user && user.id_usuario) {
        try {
            console.log(" Enviando al backend...", { uid: user.id_usuario, pid: product.id_producto, qty });
            await addItemToCartAPI(user.id_usuario, product.id_producto, qty);
            console.log("Guardado en Base de Datos");
        } catch (error) {
            console.error("Error guardando en BD (Backend falló o sin stock)", error);
            alert("El producto se agregó visualmente, pero hubo un error guardándolo en tu cuenta.");
        }
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.id_producto !== productId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};