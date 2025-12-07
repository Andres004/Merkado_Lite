{/*
    import api from '../utils/axios';
import { CartItem } from '../context/CartContext'; // O la interfaz que prefieras

// 1. AÑADIR ÍTEM (Llama a tu CartItemController)
export const addItemToCartAPI = async (id_usuario: number, id_producto: number, cantidad: number) => {
    try {
        // Tu endpoint es: POST /cartitem/add
        // Tu Body espera: { id_usuario, id_producto, cantidad }
        const response = await api.post('/cartitem/add', {
            id_usuario,
            id_producto,
            cantidad
        });
        return response.data;
    } catch (error) {
        console.error("Error agregando al carrito:", error);
        throw error;
    }
};

// 2. OBTENER MI CARRITO (Llama a CartController)
export const getMyCartAPI = async (id_usuario: number) => {
    try {
        // Tu endpoint es: GET /cart/user/:id_usuario
        const response = await api.get(`/cart/user/${id_usuario}`);
        return response.data; // Debería devolver una lista de carritos o el activo
    } catch (error) {
        console.error("Error obteniendo carrito:", error);
        return null;
    }
}; */}


import api from '../utils/axios';

// 1. AÑADIR ÍTEM (Conecta con tu CartItemController)
export const addItemToCartAPI = async (id_usuario: number, id_producto: number, cantidad: number) => {
    try {
        // Tu backend espera: { id_usuario, id_producto, cantidad }
        // Endpoint según tu código: POST /cartitem/add
        const response = await api.post('/cartitem/add', {
            id_usuario,
            id_producto,
            cantidad
        });
        return response.data;
    } catch (error) {
        console.error("Error al añadir al carrito:", error);
        throw error;
    }
};

// 2. OBTENER CARRITO (Conecta con tu CartController)
export const getMyCartAPI = async (id_usuario: number) => {
    try {
        // Endpoint según tu código: GET /cart/user/:id_usuario
        const response = await api.get(`/cart/user/${id_usuario}`);
        // Tu backend devuelve una lista de carritos, tomamos el último o el activo
        // Si devuelve un array, tomamos el primero (response.data[0])
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
        console.error("Error obteniendo carrito:", error);
        return null;
    }
};