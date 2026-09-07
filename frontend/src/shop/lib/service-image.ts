import serviceAcrylic from '@/assets/service-acrylic.webp';
import serviceGel from '@/assets/service-gel.webp';
import serviceNailart from '@/assets/service-nailart.webp';

const byCategory: Record<string, string> = {
  Acrilico: serviceAcrylic,
  'Nail Art': serviceNailart,
  Manicura: serviceGel,
  Pedicura: serviceAcrylic,
  Semipermanente: serviceGel,
};

/** Imagen a mostrar: la del servicio si tiene, o una por categoría. */
export const serviceImage = (
  image: string | null,
  category: string,
): string => image ?? byCategory[category] ?? serviceGel;
