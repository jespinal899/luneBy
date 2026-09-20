import { BadRequestException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;

  const service = {
    getServiceImagePath: jest.fn(),
    storeServiceImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      // `@Auth()` evalua `AuthGuard()` al instanciar el controller: sin la
      // estrategia registrada, Nest avisa por consola en cada spec. Los tests
      // llaman a los metodos directo, asi que el guard nunca llega a correr.
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(FilesController);
  });

  describe('findServiceImage', () => {
    it('sirve el archivo con cache-control inmutable', () => {
      service.getServiceImagePath.mockReturnValue('/ruta/foto.webp');
      const res = { set: jest.fn(), sendFile: jest.fn() } as never;

      controller.findServiceImage(res, 'foto.webp');

      expect(service.getServiceImagePath).toHaveBeenCalledWith('foto.webp');
      expect((res as { set: jest.Mock }).set).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=31536000, immutable',
      );
      expect((res as { sendFile: jest.Mock }).sendFile).toHaveBeenCalledWith(
        '/ruta/foto.webp',
      );
    });
  });

  describe('uploadServiceImage', () => {
    it('lanza BadRequestException si no viene archivo', async () => {
      await expect(
        controller.uploadServiceImage(undefined as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sube el archivo y devuelve la URL', async () => {
      const file = { buffer: Buffer.from('x') } as Express.Multer.File;
      service.storeServiceImage.mockResolvedValue('https://cdn/foto.webp');

      const res = await controller.uploadServiceImage(file);

      expect(res).toEqual({ url: 'https://cdn/foto.webp' });
      expect(service.storeServiceImage).toHaveBeenCalledWith(file);
    });
  });
});
