import { instance } from "../utils/axios";

export interface AddToCartDto {
  id_usuario: number;
  id_producto: number;
  cantidad: number;
}

// Agregar item (Ya lo tenías)
export const addToCartService = async (data: AddToCartDto) => {
  const response = await instance.post('/cartitem/add', data);
  // Emitimos un evento para que el Header se entere y actualice el número
  window.dispatchEvent(new Event("cartUpdated")); 
  return response.data;
};

// Obtener el carrito activo del usuario
export const getCartByUserService = async (id_usuario: number) => {
  // El backend devuelve un array de carritos, buscamos el activo
  const response = await instance.get(`/cart/user/${id_usuario}`);
  const carts = response.data;
  // Filtramos el que tiene estado: true
  const activeCart = carts.find((c: any) => c.estado === true);
  
  // Si encontramos el activo, pedimos sus detalles completos (con totales)
  if (activeCart) {
      const detailResponse = await instance.get(`/cart/${activeCart.id_carrito}`);
      return detailResponse.data;
  }
  return null;
};

// Actualizar cantidad de un item
export const updateCartItemService = async (id_carrito: number, id_producto: number, cantidad: number) => {
  const response = await instance.put(`/cartitem/${id_carrito}/${id_producto}`, { cantidad });
  window.dispatchEvent(new Event("cartUpdated")); 
  return response.data;
};

// Eliminar un item
export const deleteCartItemService = async (id_carrito: number, id_producto: number) => {
  const response = await instance.delete(`/cartitem/${id_carrito}/${id_producto}`);
  window.dispatchEvent(new Event("cartUpdated")); 
  return response.data;
};