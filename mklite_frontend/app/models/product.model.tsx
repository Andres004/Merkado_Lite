+12
-3

export interface CategoryModel {
    id_categoria: number;
    nombre: string;
}

// 1. Agregamos esta interfaz para definir qué trae el inventario
export interface InventoryModel {
    stock_disponible: number;
    stock_reservado?: number;
    stock_minimo?: number;
}

export interface ProductModel {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_venta: number;
    imagen_url: string;

    // Precios derivados (ofertas)
    hasDiscount?: boolean;
    discountType?: 'PERCENT' | 'FIXED' | null;
    discountValue?: number;
    discountPercent?: number;
    discountAmount?: number;
    originalPrice?: number;
    finalPrice?: number;
   
    
    // Relaciones
    productCategories?: {
        categoria: CategoryModel
    }[];

    // 2. Agregamos la propiedad inventory aquí
    inventory?: InventoryModel; 
}