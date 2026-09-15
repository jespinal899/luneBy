import { http } from '@/api/http';
import type { HeroShape } from '@/shop/lib/hero-shape';

/** Textos y foto de la portada, tal como los guardó la administradora. */
export interface Hero {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Nula = se usa la foto que viene con el sitio. */
  image: string | null;
  /** Proporción a la que se recorta y se muestra la foto. */
  imageShape: HeroShape;
}

export const getHero = async () => {
  const { data } = await http.get<Hero>('/site-content/hero');
  return data;
};

// --- Administración ---

/**
 * Guarda la portada entera. `image` viaja siempre, incluso en `null`: así
 * quitar la foto la quita de verdad en vez de dejar la anterior.
 */
export const updateHero = async (input: Hero) => {
  const { data } = await http.put<Hero>('/site-content/hero', input);
  return data;
};
