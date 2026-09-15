import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { UpdateHeroDto } from './dto';
import { SiteContent } from './entities/site-content.entity';

export interface Hero {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Nula = se usa la foto que viene con el sitio. */
  image: string | null;
}

export const HERO_KEY = 'hero';

/**
 * Lo que se ve mientras la administradora no haya guardado nada, y aquello a
 * lo que vuelve el sitio si borra la foto. Es el texto con el que la portada
 * salió a producción, así que estrenar esta funcionalidad no cambia nada de
 * lo que ya está publicado.
 */
export const DEFAULT_HERO: Hero = {
  eyebrow: 'Estudio de uñas · Choloma',
  title: 'Tus uñas, tu mejor accesorio de lujo',
  subtitle:
    'Especialistas en manicura rusa, uñas acrílicas esculpidas y nail art de autor. Cotiza tu diseño y agenda tu cita en segundos.',
  image: null,
};

/** Contenido editable del sitio público. Hoy, la portada. */
@Injectable()
export class SiteContentService {
  constructor(
    @InjectRepository(SiteContent)
    private readonly contentRepository: Repository<SiteContent>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  /**
   * La portada guardada, completada con los valores por defecto.
   *
   * Se mezcla campo por campo en lugar de devolver la fila tal cual para que
   * una fila vieja a la que le falte una clave nueva no deje ese hueco vacío
   * en el sitio.
   */
  async getHero(): Promise<Hero> {
    const row = await this.contentRepository.findOneBy({ key: HERO_KEY });
    return { ...DEFAULT_HERO, ...(row?.value as Partial<Hero> | undefined) };
  }

  async updateHero(dto: UpdateHeroDto): Promise<Hero> {
    const value: Hero = {
      eyebrow: dto.eyebrow,
      title: dto.title,
      subtitle: dto.subtitle,
      image: dto.image ?? null,
    };

    // `save` con la clave primaria puesta inserta la primera vez y actualiza
    // las siguientes: nunca hay más de una fila por bloque.
    //
    // El cast es por el `jsonb`, que se tipa como diccionario abierto: `Hero`
    // es una interfaz cerrada y no encaja sin firma de índice. La forma ya
    // quedó validada por el DTO.
    await this.contentRepository.save({
      key: HERO_KEY,
      value: value as unknown as Record<string, unknown>,
    });

    // El GET lo cachea el `CacheInterceptor` 60 s; sin esto la administradora
    // guardaría y seguiría viendo lo anterior, y pensaría que no funcionó.
    await this.cache.reset();

    return value;
  }
}
