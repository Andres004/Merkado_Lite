import { ProductModel } from './product.model';

export interface FavoriteProductModel extends ProductModel {
  inventory?: {
    stock_disponible: number;
  };
}

export interface FavoriteModel {
  id_favorito: number;
  id_usuario: number;
  id_producto: number;
  fecha_creacion: string;
  product: FavoriteProductModel;
}