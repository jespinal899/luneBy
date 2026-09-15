import serviceGel from '@/assets/service-gel.webp';

/**
 * Imagen a mostrar: la que subió la administradora, o una genérica.
 *
 * Antes la de respaldo se elegía por categoría, con un mapa fijo en el
 * código. Al dejar de usarse la categoría quedó una sola: la foto propia de
 * cada diseño es lo que de verdad lo distingue, y ahora se puede recortar
 * desde el panel.
 */
export const serviceImage = (image: string | null): string =>
  image ?? serviceGel;
