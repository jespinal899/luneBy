import { EventEmitter } from 'events';

import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

const requestMock = jest.fn();
jest.mock('node:https', () => ({
  request: (...args: unknown[]) => requestMock(...args),
}));

import { SupabaseStorageService } from './supabase-storage.service';

/** Simula la respuesta de `https.request`: emite `data` y `end` en el callback. */
function mockHttpResponse(status: number, body: string) {
  requestMock.mockImplementation((_opts, callback) => {
    const res = new EventEmitter();
    const req = new EventEmitter() as EventEmitter & {
      end: (b?: Buffer) => void;
    };
    req.end = () => {
      (callback as (res: EventEmitter & { statusCode?: number }) => void)(
        Object.assign(res, { statusCode: status }),
      );
      res.emit('data', Buffer.from(body));
      res.emit('end');
    };
    return req;
  });
}

describe('SupabaseStorageService', () => {
  const build = async (envValues: Record<string, string | undefined>) => {
    const config = { get: jest.fn((key: string) => envValues[key]) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    return moduleRef.get(SupabaseStorageService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('false si faltan las variables de entorno', async () => {
      const service = await build({});
      expect(service.isEnabled()).toBe(false);
    });

    it('true si están SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY', async () => {
      const service = await build({
        SUPABASE_URL: 'https://x.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'key',
      });
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('upload', () => {
    it('sube el archivo y devuelve la URL pública', async () => {
      const service = await build({
        SUPABASE_URL: 'https://x.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'key',
      });
      mockHttpResponse(200, '{}');

      const url = await service.upload(
        'foto.webp',
        Buffer.from('a'),
        'image/webp',
      );

      expect(url).toBe(
        'https://x.supabase.co/storage/v1/object/public/service-images/foto.webp',
      );
    });

    it('usa el bucket configurado si se especifica', async () => {
      const service = await build({
        SUPABASE_URL: 'https://x.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'key',
        SUPABASE_STORAGE_BUCKET: 'otro-bucket',
      });
      mockHttpResponse(200, '{}');

      const url = await service.upload(
        'a.webp',
        Buffer.from('a'),
        'image/webp',
      );

      expect(url).toContain('/otro-bucket/');
    });

    it('lanza InternalServerErrorException si Supabase responde error', async () => {
      const service = await build({
        SUPABASE_URL: 'https://x.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'key',
      });
      mockHttpResponse(500, 'boom');

      await expect(
        service.upload('a.webp', Buffer.from('a'), 'image/webp'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
