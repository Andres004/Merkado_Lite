import { CreateDiscountDto } from './create-discount.dto';

export class UpdateDiscountDto implements Partial<CreateDiscountDto> {
  nombre?: string;
  fecha_inicio?: string;
  fecha_final?: string;
  codigo_cupon?: string;
  porcentaje_descuento?: number;
  monto_fijo?: number;
  monto_minimo_compra?: number;
  estado_de_oferta?: boolean;
  aplica_a?: CreateDiscountDto['aplica_a'];
  target_ids?: number[];
}