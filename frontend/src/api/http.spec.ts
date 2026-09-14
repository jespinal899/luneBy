import { describe, it, expect, beforeEach } from 'vitest';

import { http, sessionMarker, tokenStorage } from './http';

// axios expone los interceptores registrados en un array interno; no hay una
// API pública para invocarlos directo, así que se accede tal cual lo hacen
// los tests de axios mismo.
interface FakeConfig {
  method: string;
  headers: Record<string, string>;
}

const requestInterceptor = (
  http.interceptors.request as unknown as {
    handlers: { fulfilled: (config: FakeConfig) => FakeConfig }[];
  }
).handlers[0].fulfilled;

const responseErrorInterceptor = (
  http.interceptors.response as unknown as {
    handlers: { rejected: (error: unknown) => Promise<never> }[];
  }
).handlers[0].rejected;

describe('tokenStorage', () => {
  beforeEach(() => localStorage.clear());

  it('guarda, lee y limpia el token', () => {
    expect(tokenStorage.get()).toBeNull();
    tokenStorage.set('abc123');
    expect(tokenStorage.get()).toBe('abc123');
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });
});

describe('sessionMarker', () => {
  beforeEach(() => sessionMarker.clear());

  it('set() deja la cookie que lee el middleware', () => {
    sessionMarker.set();
    expect(document.cookie).toContain('luneby_session=1');
  });

  it('clear() la borra', () => {
    sessionMarker.set();
    sessionMarker.clear();
    expect(document.cookie).not.toContain('luneby_session=1');
  });

  it('no guarda el token ni datos del usuario, solo el marcador', () => {
    tokenStorage.set('token-secreto-123');
    sessionMarker.set();
    expect(document.cookie).not.toContain('token-secreto-123');
  });
});

describe('interceptor de request', () => {
  beforeEach(() => localStorage.clear());

  it('no agrega Authorization si no hay token', () => {
    const config = { method: 'get', headers: {} } as FakeConfig;
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('agrega el Bearer token si existe', () => {
    tokenStorage.set('tok-1');
    const config = { method: 'get', headers: {} } as FakeConfig;
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe('Bearer tok-1');
  });

  it('agrega Idempotency-Key en escrituras (POST)', () => {
    const config = { method: 'post', headers: {} } as FakeConfig;
    const result = requestInterceptor(config);
    expect(result.headers['Idempotency-Key']).toBeTruthy();
  });

  it('no agrega Idempotency-Key en lecturas (GET)', () => {
    const config = { method: 'get', headers: {} } as FakeConfig;
    const result = requestInterceptor(config);
    expect(result.headers['Idempotency-Key']).toBeUndefined();
  });

  it('no pisa una Idempotency-Key que ya viene puesta', () => {
    const config = {
      method: 'put',
      headers: { 'Idempotency-Key': 'ya-existe' },
    } as FakeConfig;
    const result = requestInterceptor(config);
    expect(result.headers['Idempotency-Key']).toBe('ya-existe');
  });
});

describe('interceptor de response', () => {
  beforeEach(() => localStorage.clear());

  it('limpia el token cuando el backend responde 401', async () => {
    tokenStorage.set('tok-1');
    const error = { response: { status: 401 } };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(tokenStorage.get()).toBeNull();
  });

  it('no toca el token con otros errores', async () => {
    tokenStorage.set('tok-1');
    const error = { response: { status: 500 } };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(tokenStorage.get()).toBe('tok-1');
  });
});
