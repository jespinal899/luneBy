import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

/** Bandas de precio (Lempiras) que envía el FilterSidebar del frontend. */
const BANDS: Record<string, [number, number | undefined]> = {
  '0-300': [0, 300],
  '300-500': [300, 500],
  '500-800': [500, 800],
  '800+': [800, undefined],
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
