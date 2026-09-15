import { useQuery } from '@tanstack/react-query';

import { getHero, type Hero } from '@/shop/api/site-content.actions';
import { DEFAULT_HERO_SHAPE, heroShapeOf } from '@/shop/lib/hero-shape';
import heroImage from '@/assets/hero-nailart.webp';

/**
 * Portada de respaldo: el texto con el que el sitio salió a producción y la
 * foto que viene empaquetada.
 *
 * Existe para que la portada se vea siempre, incluso si la API no responde.
 * Es lo primero que ve una clienta al entrar; preferimos mostrar un texto
 * algo viejo antes que un hueco en blanco.
 */
export const FALLBACK_HERO: Hero = {
  eyebrow: 'Estudio de uñas · Choloma',
  title: 'Tus uñas, tu mejor accesorio de lujo',
  subtitle:
    'Especialistas en manicura rusa, uñas acrílicas esculpidas y nail art de autor. Cotiza tu diseño y agenda tu cita en segundos.',
  image: null,
  imageShape: DEFAULT_HERO_SHAPE,
};

/** La foto que viene con el sitio, para cuando no se subió ninguna. */
export const defaultHeroImage = heroImage;

export const useHero = () => {
  const { data } = useQuery({
    queryKey: ['site-content', 'hero'],
    queryFn: getHero,
    // Cambia muy de vez en cuando: no tiene sentido volver a pedirla en cada
    // navegación a la portada.
    staleTime: 5 * 60 * 1000,
  });

  const hero = data ?? FALLBACK_HERO;
  return {
    hero,
    image: hero.image ?? defaultHeroImage,
    shape: heroShapeOf(hero.imageShape),
  };
};
