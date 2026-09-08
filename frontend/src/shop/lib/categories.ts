/** Categorías reales de los servicios (coinciden con los valores del backend). */
export const SERVICE_CATEGORIES = [
  'Manicura',
  'Pedicura',
  'Acrilico',
  'Semipermanente',
  'Nail Art',
] as const;

/** Categoría reservada para los complementos (servicios de tipo "estilo"). */
export const ESTILO_CATEGORY = 'Estilo';

export const PRICE_BANDS = [
  { value: 'any', label: 'Cualquier precio' },
  { value: '0-300', label: 'Hasta L. 300' },
  { value: '300-500', label: 'L. 300 - 500' },
  { value: '500-800', label: 'L. 500 - 800' },
  { value: '800+', label: 'Más de L. 800' },
] as const;
