import { BadRequestException, ConflictException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { Observable, of, firstValueFrom } from 'rxjs';

import { IdempotencyInterceptor } from './idempotency.interceptor';
import { IdempotencyKey } from '../entities/idempotency-key.entity';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;

  const repo = {
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };
  const reflector = { get: jest.fn() };

  const makeContext = (req: Record<string, unknown>, res: unknown) => ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
    getHandler: () => ({}),
  });

  const makeReq = (method: string, header?: string) => ({
    method,
    path: '/api/x',
    user: { id: 'u1' },
    header: jest.fn().mockReturnValue(header),
  });

  const makeRes = () => ({
    status: jest.fn(),
    setHeader: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        { provide: Reflector, useValue: reflector },
        { provide: getRepositoryToken(IdempotencyKey), useValue: repo },
      ],
    }).compile();
    interceptor = moduleRef.get(IdempotencyInterceptor);
  });

  it('deja pasar sin tocar el repo si el método no escribe (GET)', async () => {
    const req = makeReq('GET');
    const next = { handle: jest.fn().mockReturnValue(of('ok')) };

    const result = await interceptor.intercept(
      makeContext(req, makeRes()) as never,
      next,
    );

    expect(await firstValueFrom(result)).toBe('ok');
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('deja pasar si no viene la cabecera Idempotency-Key', async () => {
    const req = makeReq('POST', undefined);
    const next = { handle: jest.fn().mockReturnValue(of('ok')) };

    const result = await interceptor.intercept(
      makeContext(req, makeRes()) as never,
      next,
    );

    expect(await firstValueFrom(result)).toBe('ok');
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('rechaza una key con formato inválido', async () => {
    const req = makeReq('POST', 'a');
    const next = { handle: jest.fn() };

    await expect(
      interceptor.intercept(makeContext(req, makeRes()) as never, next),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('primera vez: inserta, ejecuta el handler y guarda la respuesta', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.insert.mockResolvedValue(undefined);
    repo.update.mockResolvedValue(undefined);
    reflector.get.mockReturnValue(undefined);
    const req = makeReq('POST', 'clave-valida-123');
    const next = { handle: jest.fn().mockReturnValue(of({ ok: true })) };

    const result = await interceptor.intercept(
      makeContext(req, makeRes()) as never,
      next,
    );

    expect(await firstValueFrom(result)).toEqual({ ok: true });
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'clave-valida-123', method: 'POST' }),
    );
    expect(repo.update).toHaveBeenCalledWith(
      { key: 'clave-valida-123' },
      expect.objectContaining({ statusCode: 201 }),
    );
  });

  it('reintento con respuesta ya completa: devuelve lo guardado sin ejecutar', async () => {
    repo.findOne.mockResolvedValue({
      completedAt: new Date(),
      statusCode: 201,
      response: { cached: true },
      method: 'POST',
      path: '/api/x',
    });
    const req = makeReq('POST', 'clave-valida-123');
    const res = makeRes();
    const next = { handle: jest.fn() };

    const result = await interceptor.intercept(
      makeContext(req, res) as never,
      next,
    );

    expect(await firstValueFrom(result)).toEqual({ cached: true });
    expect(next.handle).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Idempotency-Replayed', 'true');
  });

  it('reintento en curso (sin completedAt): responde 409', async () => {
    repo.findOne.mockResolvedValue({ completedAt: null });
    const req = makeReq('POST', 'clave-valida-123');
    const next = { handle: jest.fn() };

    await expect(
      interceptor.intercept(makeContext(req, makeRes()) as never, next),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('si el insert falla por carrera y ya hay una en curso, responde 409', async () => {
    repo.findOne
      .mockResolvedValueOnce(null) // primer intento de replay
      .mockResolvedValueOnce({ completedAt: null }); // tras el insert fallido
    repo.insert.mockRejectedValue(new Error('duplicate key'));
    const req = makeReq('POST', 'clave-valida-123');
    const next = { handle: jest.fn() };

    await expect(
      interceptor.intercept(makeContext(req, makeRes()) as never, next),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('usa el HttpCode del reflector si está presente', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.insert.mockResolvedValue(undefined);
    repo.update.mockResolvedValue(undefined);
    reflector.get.mockReturnValue(200);
    const req = makeReq('POST', 'clave-valida-123');
    const next = { handle: jest.fn().mockReturnValue(of('ok')) };

    const result = await interceptor.intercept(
      makeContext(req, makeRes()) as never,
      next,
    );
    await firstValueFrom(result);

    expect(repo.update).toHaveBeenCalledWith(
      { key: 'clave-valida-123' },
      expect.objectContaining({ statusCode: 200 }),
    );
  });

  it('si el handler falla, libera la key y propaga el error', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.insert.mockResolvedValue(undefined);
    repo.delete.mockResolvedValue(undefined);
    reflector.get.mockReturnValue(undefined);
    const req = makeReq('POST', 'clave-valida-123');
    const boom = new Error('boom');
    const next = {
      handle: jest.fn().mockReturnValue(
        new Observable((subscriber) => {
          subscriber.error(boom);
        }),
      ),
    };

    const result = await interceptor.intercept(
      makeContext(req, makeRes()) as never,
      next,
    );

    await expect(firstValueFrom(result)).rejects.toThrow('boom');
    expect(repo.delete).toHaveBeenCalledWith({ key: 'clave-valida-123' });
  });
});
