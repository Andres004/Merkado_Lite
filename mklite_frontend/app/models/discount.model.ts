export type DiscountScope = 'ALL' | 'CATEGORY' | 'PRODUCT';

export interface DiscountTargetProduct {
    id_producto: number;
    nombre?: string;
}

export interface DiscountTargetCategory {
    id_categoria: number;
    nombre?: string;
}

export interface DiscountModel {
    id_descuento: number;
    nombre: string;
    fecha_inicio: string;
    fecha_final: string;
    codigo_cupon?: string;
    porcentaje_descuento?: number;
    monto_fijo?: number;
    monto_minimo_compra?: number;
    estado_de_oferta: boolean;
    aplica_a: DiscountScope;
    productos?: DiscountTargetProduct[];
    categorias?: DiscountTargetCategory[];
}

export interface CreateDiscountDto {
    nombre: string;
    fecha_inicio: string;
    fecha_final: string;
    codigo_cupon?: string;
    porcentaje_descuento?: number;
    monto_fijo?: number;
    monto_minimo_compra?: number;
    estado_de_oferta: boolean;
    aplica_a: DiscountScope;
    target_ids?: number[];
}