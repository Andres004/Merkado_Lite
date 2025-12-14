import { DiscountScope } from 'src/entity/discount.entity';

export class CreateDiscountDto {
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