import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

const sharpChain = {
  rotate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toBuffer: jest.fn(),
};
jest.mock('sharp', () => jest.fn(() => sharpChain));

import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';

import { FilesService } from './files.service';
import { SupabaseStorageService } from './storage/supabase-storage.service';

describe('FilesService', () => {
  let service: FilesService;

  const config = { get: jest.fn() };
  const supabase = { isEnabled: jest.fn(), upload: jest.fn() };

  const file = {
    buffer: Buffer.from('img'),
    mimetype: 'image/png',
    size: 123,
  } as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();
    sharpChain.rotate.mockReturnThis();
    sharpChain.resize.mockReturnThis();
    sharpChain.webp.mockReturnThis();
    sharpChain.toBuffer.mockResolvedValue(Buffer.from('optimizado'));

    const moduleRef = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: ConfigService, useValue: config },
        { provide: SupabaseStorageService, useValue: supabase },
      ],
    }).compile();
    service = moduleRef.get(FilesService);
  });

  describe('storeServiceImage', () => {
    it('sube a Supabase cuando está habilitado', async () => {
      supabase.isEnabled.mockReturnValue(true);
      supabase.upload.mockResolvedValue('https://cdn/servicio.webp');

      const url = await service.storeServiceImage(file);

      expect(url).toBe('https://cdn/servicio.webp');
      expect(supabase.upload).toHaveBeenCalledWith(
        expect.stringMatching(/\.webp$/),
        expect.any(Buffer),
        'image/webp',
      );
    });

    it('guarda en disco local cuando Supabase no está habilitado', async () => {
      supabase.isEnabled.mockReturnValue(false);
      config.get.mockReturnValue('http://localhost:3001/api');
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);

      const url = await service.storeServiceImage(file);

      expect(url).toMatch(
        /^http:\/\/localhost:3001\/api\/files\/service\/.+\.webp$/,
      );
      expect(writeFile).toHaveBeenCalled();
    });

    it('usa el host por defecto si HOST_API no está configurado', async () => {
      supabase.isEnabled.mockReturnValue(false);
      config.get.mockReturnValue(undefined);
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);

      const url = await service.storeServiceImage(file);

      expect(url).toMatch(/^http:\/\/localhost:3001\/api\//);
    });

    it('si falla el guardado, lanza InternalServerErrorException', async () => {
      supabase.isEnabled.mockReturnValue(true);
      supabase.upload.mockRejectedValue(new Error('boom'));

      await expect(service.storeServiceImage(file)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('si sharp falla, guarda el archivo original sin optimizar', async () => {
      sharpChain.toBuffer.mockRejectedValue(new Error('sharp no disponible'));
      supabase.isEnabled.mockReturnValue(true);
      supabase.upload.mockResolvedValue('https://cdn/original.png');

      const url = await service.storeServiceImage(file);

      expect(url).toBe('https://cdn/original.png');
      expect(supabase.upload).toHaveBeenCalledWith(
        expect.any(String),
        file.buffer,
        'image/png',
      );
    });
  });

  describe('getServiceImagePath', () => {
    it('devuelve la ruta si el archivo existe', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      const path = service.getServiceImagePath('foto.webp');

      expect(path).toContain('foto.webp');
    });

    it('lanza BadRequestException si no existe', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(() => service.getServiceImagePath('no-existe.webp')).toThrow(
        BadRequestException,
      );
    });
  });
});
