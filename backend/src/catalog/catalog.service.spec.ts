import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CatalogService } from './catalog.service';
import { CatalogItem } from './entities/catalog-item.entity';

describe('CatalogService', () => {
  let service: CatalogService;

  const qb = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const catalogRepository = {
    createQueryBuilder: jest.fn(() => qb),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };
  const cache = { reset: jest.fn() };

  const makeItem = (over: Partial<CatalogItem> = {}) =>
    ({
      id: '1',
      name: 'Soft Glam',
      price: 450,
      image: null,
      description: null,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      service: {
        id: 'svc-1',
        name: 'Manicura',
        price: 350,
        durationMin: 45,
        category: 'Manos',
        slug: 'manicura',
        description: 'desc del servicio',
      },
      ...over,
    }) as unknown as CatalogItem;

  beforeEach(async () => {
    jest.clearAllMocks();
    qb.innerJoinAndSelect.mockReturnThis();
    qb.andWhere.mockReturnThis();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getRepositoryToken(CatalogItem),
          useValue: catalogRepository,
        },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();
    service = moduleRef.get(CatalogService);
  });

  describe('findAll', () => {
    it('expone el nombre y precio del diseño, no los del servicio', async () => {
      qb.getMany.mockResolvedValue([makeItem()]);

      const res = await service.findAll({});

      expect(res.products[0]).toMatchObject({
        id: '1',
        serviceId: 'svc-1',
        // Propios del diseño.
        name: 'Soft Glam',
        price: 450,
        // Del servicio al que pertenece.
        serviceName: 'Manicura',
        durationMin: 45,
      });
    });

    it('varios diseños del mismo servicio conservan su identidad', async () => {
      qb.getMany.mockResolvedValue([
        makeItem({ id: '1', name: 'Soft Glam', price: 450 } as never),
        makeItem({ id: '2', name: 'French', price: 380 } as never),
      ]);

      const res = await service.findAll({}, { includeHidden: true });

      expect(res.products.map((p) => [p.name, p.price])).toEqual([
        ['French', 380],
        ['Soft Glam', 450],
      ]);
      // Los dos siguen apuntando al mismo servicio.
      expect(new Set(res.products.map((p) => p.serviceName))).toEqual(
        new Set(['Manicura']),
      );
    });

    // El paso 1 de agendar muestra, al elegir "Esmaltado", solo los diseños
    // que le pertenecen.
    it('filtra los diseños por servicio cuando se pide', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({ servicios: 'svc-1' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'service.id IN (:...serviceIds)',
        {
          serviceIds: ['svc-1'],
        },
      );
    });

    it('acepta varios servicios a la vez, para el panel de filtros', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({ servicios: 'svc-1,svc-2' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'service.id IN (:...serviceIds)',
        {
          serviceIds: ['svc-1', 'svc-2'],
        },
      );
    });

    it('sin servicios no filtra por servicio', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({});

      expect(qb.andWhere).not.toHaveBeenCalledWith(
        'service.id IN (:...serviceIds)',
        expect.anything(),
      );
    });

    it('por defecto filtra por isActive en item y servicio', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({});

      expect(qb.andWhere).toHaveBeenCalledWith('item."isActive" = true');
      expect(qb.andWhere).toHaveBeenCalledWith('service."isActive" = true');
    });

    it('con includeHidden no agrega el filtro de isActive', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({}, { includeHidden: true });

      expect(qb.andWhere).not.toHaveBeenCalledWith('item."isActive" = true');
    });

    it('usa la descripción propia si existe, si no la del servicio', async () => {
      qb.getMany.mockResolvedValue([
        makeItem({ description: 'propia' }),
        makeItem({ id: '2', description: null }),
      ]);

      const res = await service.findAll({}, { includeHidden: true });

      expect(res.products.find((p) => p.id === '1')?.description).toBe(
        'propia',
      );
      expect(res.products.find((p) => p.id === '2')?.description).toBe(
        'desc del servicio',
      );
    });

    it('filtra por categorías CSV', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({ categorias: 'Manos, Pies' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'service.category IN (:...categories)',
        { categories: ['Manos', 'Pies'] },
      );
    });

    it('busca por el nombre del diseño y también por el del servicio', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({ q: 'glam' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(item.name ILIKE :q OR service.name ILIKE :q)',
        { q: '%glam%' },
      );
    });

    it('filtra por el precio del diseño, que es el que se muestra', async () => {
      qb.getMany.mockResolvedValue([]);

      await service.findAll({ minPrice: 300, maxPrice: 500 });

      expect(qb.andWhere).toHaveBeenCalledWith('item.price >= :lo', {
        lo: 300,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('item.price <= :hi', {
        hi: 500,
      });
    });

    it('con sort=recent ordena por createdAt descendente', async () => {
      qb.getMany.mockResolvedValue([
        makeItem({ id: '1', createdAt: new Date('2026-01-01') }),
        makeItem({ id: '2', createdAt: new Date('2026-09-10') }),
      ]);

      const res = await service.findAll({ sort: 'recent' });

      expect(res.products.map((p) => p.id)).toEqual(['2', '1']);
    });

    it('pagina el resultado', async () => {
      const rows = Array.from({ length: 15 }, (_, i) =>
        makeItem({
          id: String(i),
          service: {
            id: `svc-${i}`,
            name: `Diseño ${String(i).padStart(2, '0')}`,
            price: 100,
            durationMin: 30,
            category: 'X',
            slug: `d-${i}`,
            description: '',
          } as unknown as CatalogItem['service'],
        }),
      );
      qb.getMany.mockResolvedValue(rows);

      const res = await service.findAll({ page: 2, limit: 10 });

      expect(res.count).toBe(15);
      expect(res.pages).toBe(2);
      expect(res.products).toHaveLength(5);
    });
  });

  describe('findOne', () => {
    it('devuelve la vista aplanada cuando existe', async () => {
      catalogRepository.findOneBy.mockResolvedValue(makeItem());

      const res = await service.findOne('1');

      expect(res.name).toBe('Soft Glam');
    });

    it('lanza NotFoundException si no existe', async () => {
      catalogRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('crea, invalida caché y devuelve la vista', async () => {
      catalogRepository.create.mockReturnValue({ id: '1' });
      catalogRepository.save.mockResolvedValue(undefined);
      catalogRepository.findOneBy.mockResolvedValue(makeItem());

      const res = await service.create({
        serviceId: 'svc-1',
        image: null,
        description: null,
      } as never);

      expect(catalogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ service: { id: 'svc-1' } }),
      );
      expect(cache.reset).toHaveBeenCalled();
      expect(res.name).toBe('Soft Glam');
    });
  });

  describe('update', () => {
    it('actualiza cuando existe', async () => {
      catalogRepository.preload.mockResolvedValue({ id: '1' });
      catalogRepository.save.mockResolvedValue(undefined);
      catalogRepository.findOneBy.mockResolvedValue(makeItem());

      const res = await service.update('1', { image: 'foto.jpg' } as never);

      expect(cache.reset).toHaveBeenCalled();
      expect(res.name).toBe('Soft Glam');
    });

    it('lanza NotFoundException si preload no encuentra nada', async () => {
      catalogRepository.preload.mockResolvedValue(null);

      await expect(service.update('x', {} as never)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('incluye el nuevo service en el preload si viene serviceId', async () => {
      catalogRepository.preload.mockResolvedValue({ id: '1' });
      catalogRepository.save.mockResolvedValue(undefined);
      catalogRepository.findOneBy.mockResolvedValue(makeItem());

      await service.update('1', { serviceId: 'svc-2' } as never);

      expect(catalogRepository.preload).toHaveBeenCalledWith(
        expect.objectContaining({ service: { id: 'svc-2' } }),
      );
    });
  });

  describe('remove', () => {
    it('elimina e invalida caché cuando existe', async () => {
      const item = makeItem();
      catalogRepository.findOneBy.mockResolvedValue(item);

      await service.remove('1');

      expect(catalogRepository.remove).toHaveBeenCalledWith(item);
      expect(cache.reset).toHaveBeenCalled();
    });

    it('lanza NotFoundException si no existe', async () => {
      catalogRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
