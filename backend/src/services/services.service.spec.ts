import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

describe('ServicesService', () => {
  let service: ServicesService;

  const serviceRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
  const cache = { reset: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: serviceRepository,
        },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();
    service = moduleRef.get(ServicesService);
  });

  describe('findAll', () => {
    it('pagina y devuelve { count, page, pages, products }', async () => {
      const rows = Array.from({ length: 25 }, (_, i) => ({
        id: String(i),
        name: `Servicio ${String(i).padStart(2, '0')}`,
      }));
      serviceRepository.find.mockResolvedValue(rows);

      const res = await service.findAll({ page: 2, limit: 10 });

      expect(res.count).toBe(25);
      expect(res.page).toBe(2);
      expect(res.pages).toBe(3);
      expect(res.products).toHaveLength(10);
      expect(res.products[0]).toEqual(rows[10]);
    });

    it('ordena sin distinguir mayúsculas/minúsculas', async () => {
      serviceRepository.find.mockResolvedValue([
        { id: '1', name: 'manicure' },
        { id: '2', name: 'Diseños' },
        { id: '3', name: 'Esmaltado' },
      ]);

      const res = await service.findAll({ limit: 10 });

      expect(res.products.map((s) => s.name)).toEqual([
        'Diseños',
        'Esmaltado',
        'manicure',
      ]);
    });

    it('con sort=recent ordena por createdAt descendente (aunque sea último alfabético)', async () => {
      serviceRepository.find.mockResolvedValue([
        { id: '1', name: 'Diseños', createdAt: new Date('2026-01-01') },
        { id: '2', name: 'manicure', createdAt: new Date('2026-09-10') },
      ]);

      const res = await service.findAll({ limit: 10, sort: 'recent' });

      expect(res.products.map((s) => s.name)).toEqual(['manicure', 'Diseños']);
    });

    it('por defecto solo pide los servicios visibles (isActive)', async () => {
      serviceRepository.find.mockResolvedValue([]);

      await service.findAll({});

      expect(serviceRepository.find.mock.calls[0][0].where.isActive).toBe(true);
    });

    it('con includeHidden no filtra por isActive (panel admin)', async () => {
      serviceRepository.find.mockResolvedValue([]);

      await service.findAll({}, { includeHidden: true });

      expect(
        serviceRepository.find.mock.calls[0][0].where.isActive,
      ).toBeUndefined();
    });

    it('filtra por categorías (CSV) con un operador In', async () => {
      serviceRepository.find.mockResolvedValue([]);

      await service.findAll({ categorias: 'Manicura, Pedicura' });

      const where = serviceRepository.find.mock.calls[0][0].where;
      expect(where.category.type).toBe('in');
      expect(where.category.value).toEqual(['Manicura', 'Pedicura']);
    });
  });

  describe('findOne', () => {
    it('busca por slug cuando el término no es UUID', async () => {
      serviceRepository.findOneBy.mockResolvedValue({
        id: '1',
        slug: 'manicura',
      });

      await service.findOne('manicura');

      expect(serviceRepository.findOneBy).toHaveBeenCalledWith({
        slug: 'manicura',
      });
    });

    it('lanza NotFoundException si no existe', async () => {
      serviceRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('inexistente')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
