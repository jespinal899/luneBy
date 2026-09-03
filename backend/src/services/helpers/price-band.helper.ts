import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

/** Bandas de precio que envía el FilterSidebar del frontend. */
const BANDS: Record<string, [number, number | undefined]> = {
  '0-50': [0, 50],
  '50-100': [50, 100],
  '100-200': [100, 200],
  '200+': [200, undefined],
};

/**
 * Traduce la banda de precio (o los límites `minPrice` / `maxPrice` sueltos)
 * a un operador de TypeORM para el `where`. La banda tiene prioridad.
 * Devuelve `undefined` si no hay ningún filtro de precio aplicable.
 */
export function priceFilter(opts: {
  price?: string;
  minPrice?: number;
  maxPrice?: number;
}): FindOperator<number> | undefined {
  let lo = opts.minPrice;
  let hi = opts.maxPrice;

  if (opts.price && opts.price !== 'any' && BANDS[opts.price]) {
    [lo, hi] = BANDS[opts.price];
  }

  if (lo !== undefined && hi !== undefined) return Between(lo, hi);
  if (lo !== undefined) return MoreThanOrEqual(lo);
  if (hi !== undefined) return LessThanOrEqual(hi);
  return undefined;
}
