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
 * Límites numéricos del filtro de precio. La banda tiene prioridad sobre
 * `minPrice` / `maxPrice` sueltos. Lo usa tanto el `where` del repositorio
 * (`priceFilter`) como el `QueryBuilder` del catálogo, que filtra por el
 * precio del servicio asociado y no puede usar operadores de TypeORM.
 */
export function priceBounds(opts: {
  price?: string;
  minPrice?: number;
  maxPrice?: number;
}): { lo?: number; hi?: number } {
  let lo = opts.minPrice;
  let hi = opts.maxPrice;

  if (opts.price && opts.price !== 'any' && BANDS[opts.price]) {
    [lo, hi] = BANDS[opts.price];
  }

  return { lo, hi };
}

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
  const { lo, hi } = priceBounds(opts);

  if (lo !== undefined && hi !== undefined) return Between(lo, hi);
  if (lo !== undefined) return MoreThanOrEqual(lo);
  if (hi !== undefined) return LessThanOrEqual(hi);
  return undefined;
}
