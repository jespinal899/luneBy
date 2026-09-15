/**
 * Formas en las que se puede mostrar la foto de la portada.
 *
 * La foto se sigue recortando a una proporción conocida —si cada una tomara
 * la suya, el alto de la portada cambiaría con cada foto y el texto de al lado
 * saltaría al cargar— pero la elige la administradora según cómo esté tomada
 * la foto, en vez de estar fija en vertical.
 *
 * Las clases van escritas enteras y no armadas con plantillas porque Tailwind
 * las busca por texto en el código: `aspect-[${x}]` no generaría nada.
 */
export type HeroShape = 'vertical' | 'cuadrada' | 'horizontal';

export const HERO_SHAPES: Record<
  HeroShape,
  { label: string; hint: string; ratio: number; className: string }
> = {
  vertical: {
    label: 'Vertical',
    hint: 'Para fotos tomadas de pie, como una mano en primer plano.',
    ratio: 4 / 5,
    className: 'aspect-[4/5]',
  },
  cuadrada: {
    label: 'Cuadrada',
    hint: 'Equilibrada. Sirve para casi cualquier foto.',
    ratio: 1,
    className: 'aspect-square',
  },
  horizontal: {
    label: 'Horizontal',
    hint: 'Para fotos apaisadas, como las dos manos juntas.',
    ratio: 4 / 3,
    className: 'aspect-[4/3]',
  },
};

export const DEFAULT_HERO_SHAPE: HeroShape = 'vertical';

/** Tolera una forma desconocida (una guardada por una versión posterior). */
export const heroShapeOf = (shape: string | null | undefined) =>
  HERO_SHAPES[(shape as HeroShape) ?? DEFAULT_HERO_SHAPE] ??
  HERO_SHAPES[DEFAULT_HERO_SHAPE];
