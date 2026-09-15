import { useQuery } from '@tanstack/react-query';

import { getHero, type Hero } from '@/shop/api/site-content.actions';
import { DEFAULT_HERO_SHAPE, heroShapeOf } from '@/shop/lib/hero-shape';
import heroImage from '@/assets/hero-nailart.webp';

/**
 * Portada de respaldo: el texto con el que el sitio salió a producción y la
 * foto que viene empaquetada.
 *
 * Se usa solo cuando la API falla y no hay nada guardado en el navegador. No
 * se muestra mientras se espera la respuesta: hacerlo provocaba un parpadeo
 * en el que se veía el texto viejo y enseguida el nuevo.
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

const CACHE_KEY = 'luneby:hero';

/**
 * Última portada que vio este navegador.
 *
 * Sirve para pintar la portada correcta en el primer cuadro al recargar, en
 * vez de esperar a la API. Puede fallar o venir vacío —ventana privada, datos
 * del sitio bloqueados—, así que nunca se da por hecho que hay algo.
 */
const readCachedHero = (): Hero | undefined => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Hero) : undefined;
  } catch {
    return undefined;
  }
};

const writeCachedHero = (hero: Hero) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(hero));
  } catch {
    // Sin caché se ve un poco más tarde, nada más. No es motivo para romper.
  }
};

export const useHero = () => {
  const cached = readCachedHero();

  const { data, isPending, isError } = useQuery({
    queryKey: ['site-content', 'hero'],
    queryFn: async () => {
      const hero = await getHero();
      writeCachedHero(hero);
      return hero;
    },
    // Cambia muy de vez en cuando: no tiene sentido volver a pedirla en cada
    // navegación a la portada.
    staleTime: 5 * 60 * 1000,
    // Se pinta lo del navegador en el primer cuadro y se revalida igual: si
    // Kelin cambió la portada desde otro dispositivo, se actualiza sola.
    initialData: cached,
    initialDataUpdatedAt: 0,
  });

  const hero = data ?? FALLBACK_HERO;

  return {
    hero,
    image: hero.image ?? defaultHeroImage,
    shape: heroShapeOf(hero.imageShape),
    /**
     * Todavía no se sabe qué portada mostrar: no hay nada guardado en este
     * navegador y la API aún no respondió. Quien la use debe reservar el
     * espacio en vez de pintar el respaldo, que es lo que causaba el parpadeo.
     */
    isUnknown: isPending && !isError,
  };
};
