export interface CategoryModel {
    id_categoria: number;
    nombre: string;
}

export interface ProductModel {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_venta: number;        
    //stock_actual?: number; // Opcional
    imagen_url: string;      
    //estado?: boolean;
    
    
    productCategories?: {
        categoria: CategoryModel
    }[];
}