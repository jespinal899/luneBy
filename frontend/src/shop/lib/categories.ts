/** Categorías reales de los servicios (coinciden con los valores del backend). */
export const SERVICE_CATEGORIES = [
  'Manicura',
  'Pedicura',
  'Acrilico',
  'Semipermanente',
  'Nail Art',
] as const;

export const PRICE_BANDS = [
  { value: 'any', label: 'Cualquier precio' },
  { value: '0-50', label: '$0 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200+', label: '$200+' },
] as const;
