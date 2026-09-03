import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';

describe('ServicesService', () => {
  let service: ServicesService;

  const serviceRepository = {
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: serviceRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(ServicesService);
  });

  describe('findAll', () => {
    it('pagina y devuelve { count, page, pages, products }', async () => {
      serviceRepository.findAndCount.mockResolvedValue([[{ id: '1' }], 25]);

      const res = await service.findAll({ page: 2, limit: 10 });

      expect(serviceRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 10 }),
      );
      expect(res).toEqual({
        count: 25,
        page: 2,
        pages: 3,
        products: [{ id: '1' }],
      });
    });

    it('filtra por categorías (CSV) con un operador In', async () => {
      serviceRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ categorias: 'Manicura, Pedicura' });

      const where = serviceRepository.findAndCount.mock.calls[0][0].where;
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
