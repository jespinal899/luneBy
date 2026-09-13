import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';

import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

describe('CatalogController', () => {
  let controller: CatalogController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: CatalogService, useValue: service },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();
    controller = moduleRef.get(CatalogController);
  });

  it('findAll delega en el servicio sin includeHidden', () => {
    controller.findAll({ page: 1 } as never);
    expect(service.findAll).toHaveBeenCalledWith({ page: 1 });
  });

  it('findAllForAdmin delega en el servicio con includeHidden', () => {
    controller.findAllForAdmin({ page: 1 } as never);
    expect(service.findAll).toHaveBeenCalledWith(
      { page: 1 },
      { includeHidden: true },
    );
  });

  it('findOne delega en el servicio', () => {
    controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('create delega en el servicio', () => {
    const dto = { serviceId: '1' } as never;
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delega en el servicio', () => {
    const dto = { image: 'x' } as never;
    controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('remove delega en el servicio', () => {
    controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
