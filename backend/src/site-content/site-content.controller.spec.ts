import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';

import { META_ROLES } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

describe('SiteContentController', () => {
  let controller: SiteContentController;

  const service = { getHero: jest.fn(), updateHero: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [SiteContentController],
      providers: [
        { provide: SiteContentService, useValue: service },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();
    controller = moduleRef.get(SiteContentController);
  });

  it('getHero delega en el servicio', () => {
    controller.getHero();
    expect(service.getHero).toHaveBeenCalled();
  });

  it('updateHero delega en el servicio', () => {
    const dto = {
      eyebrow: 'a',
      title: 'b',
      subtitle: 'c',
      image: null,
    };
    controller.updateHero(dto);
    expect(service.updateHero).toHaveBeenCalledWith(dto);
  });

  // La portada la ve cualquier visitante, pero cambiarla es solo de la
  // administradora. Si alguien quita el @Auth, esta prueba lo detecta.
  it('solo la administradora puede cambiar la portada', () => {
    expect(
      Reflect.getMetadata(META_ROLES, SiteContentController.prototype.getHero),
    ).toBeUndefined();

    expect(
      Reflect.getMetadata(
        META_ROLES,
        SiteContentController.prototype.updateHero,
      ),
    ).toEqual([ValidRoles.admin]);
  });
});
