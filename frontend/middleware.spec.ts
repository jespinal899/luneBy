import { describe, expect, it, vi } from 'vitest';

// `next()` en producción devuelve una respuesta especial que le dice a Vercel
// "seguí con el pipeline normal"; acá alcanza con poder distinguirla.
vi.mock('@vercel/edge', () => ({
  next: () => new Response(null, { headers: { 'x-middleware-next': '1' } }),
}));

import middleware, { config } from './middleware';

const request = (path: string, cookie?: string) =>
  new Request(`https://www.jespinal03.casa${path}`, {
    headers: cookie ? { cookie } : {},
  });

describe('middleware de rutas privadas', () => {
  it('sin cookie de sesión, redirige al login conservando el destino', () => {
    const res = middleware(request('/admin/citas'));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/auth/login');
    expect(location.searchParams.get('from')).toBe('/admin/citas');
  });

  it('con cookie de sesión, deja pasar la petición', () => {
    const res = middleware(request('/admin', 'luneby_session=1'));

    expect(res.headers.get('x-middleware-next')).toBe('1');
    expect(res.status).not.toBe(307);
  });

  it('reconoce la cookie aunque venga junto a otras', () => {
    const res = middleware(
      request('/perfil', 'otra=abc; luneby_session=1; mas=xyz'),
    );

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('no confunde una cookie de nombre parecido', () => {
    const res = middleware(request('/admin', 'luneby_session_falsa=1'));

    expect(res.status).toBe(307);
  });

  it('cubre las rutas privadas del router y ninguna pública', () => {
    expect(config.matcher).toEqual([
      '/admin',
      '/admin/:path*',
      '/perfil',
      '/mis-citas',
    ]);
  });
});
