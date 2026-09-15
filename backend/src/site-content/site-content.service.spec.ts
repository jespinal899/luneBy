import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SiteContent } from './entities/site-content.entity';
import {
  DEFAULT_HERO,
  HERO_KEY,
  SiteContentService,
} from './site-content.service';

describe('SiteContentService', () => {
  let service: SiteContentService;

  const contentRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };
  const cache = { reset: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SiteContentService,
        {
          provide: getRepositoryToken(SiteContent),
          useValue: contentRepository,
        },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = moduleRef.get(SiteContentService);
  });

  describe('getHero', () => {
    it('devuelve la portada por defecto mientras no se haya guardado nada', async () => {
      contentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getHero()).resolves.toEqual(DEFAULT_HERO);
    });

    it('devuelve lo guardado cuando existe', async () => {
      const value = {
        eyebrow: 'Nail bar · Choloma',
        title: 'Tu estilo, tus reglas',
        subtitle: 'Diseños de autor.',
        image: 'https://cdn.test/portada.webp',
        imageShape: 'horizontal' as const,
      };
      contentRepository.findOneBy.mockResolvedValue({ key: HERO_KEY, value });

      await expect(service.getHero()).resolves.toEqual(value);
    });

    // Una fila vieja a la que le falte una clave nueva no debe dejar ese
    // hueco vacío en la portada.
    it('completa con los valores por defecto los campos que falten', async () => {
      contentRepository.findOneBy.mockResolvedValue({
        key: HERO_KEY,
        value: { title: 'Solo el título' },
      });

      await expect(service.getHero()).resolves.toEqual({
        ...DEFAULT_HERO,
        title: 'Solo el título',
      });
    });
  });

  describe('updateHero', () => {
    const dto = {
      eyebrow: 'Nail bar · Choloma',
      title: 'Tu estilo, tus reglas',
      subtitle: 'Diseños de autor.',
      image: 'https://cdn.test/portada.webp',
      imageShape: 'horizontal' as const,
    };

    it('guarda siempre bajo la misma clave, para que no haya dos portadas', async () => {
      await service.updateHero(dto);

      expect(contentRepository.save).toHaveBeenCalledWith({
        key: HERO_KEY,
        value: dto,
      });
    });

    // Sin esto la administradora guardaría y seguiría viendo lo anterior
    // durante 60 s, y pensaría que no funcionó.
    it('vacía la caché del GET público', async () => {
      await service.updateHero(dto);

      expect(cache.reset).toHaveBeenCalled();
    });

    it('guarda la imagen en null cuando no viene, para volver a la del sitio', async () => {
      const { image: _omitted, ...sinImagen } = dto;

      await expect(service.updateHero(sinImagen)).resolves.toEqual({
        ...sinImagen,
        image: null,
      });
    });
  });
});
