import api from '../utils/axios'; // instancia de Axios configurada
import { ProductModel } from '../models/product.model';


// URLs base de tu backend
const PRODUCT_URL = '/product'; 
const PRODUCT_CATEGORY_URL = '/productcategory/category';


export const getAllProducts = async (): Promise<ProductModel[]> => {
    try {
        // Hacemos GET http://localhost:3005/product
        const response = await api.get<ProductModel[]>(PRODUCT_URL);
        return response.data;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return []; 
    }
}


// ==========================================
// OBTENER UN PRODUCTO POR ID (Detalle)
// ==========================================
export const getProductById = async (id_producto: number): Promise<ProductModel | null> => {
    try {
        // GET /product/:id
        const response = await api.get<ProductModel>(`${PRODUCT_URL}/${id_producto}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener producto ${id_producto}:`, error);
        return null;
    }
}

// ==========================================
//  OBTENER PRODUCTOS POR CATEGORÍA
// ==========================================
export const getProductsByCategoryId = async (id_categoria: number): Promise<ProductModel[]> => {
    try {
        
        const response = await api.get<any[]>(`${PRODUCT_CATEGORY_URL}/${id_categoria}`);
        
        const cleanProducts = response.data
            .filter(item => item.producto)
            .map((item) => item.producto as ProductModel);
        
        return cleanProducts;
    } catch (error) {
        console.error(`Error al obtener productos de la categoría ${id_categoria}:`, error);
        return [];
    }
}