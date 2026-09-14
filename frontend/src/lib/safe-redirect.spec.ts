import { describe, expect, it } from 'vitest';

import { safeInternalPath } from './safe-redirect';

describe('safeInternalPath', () => {
  it('acepta una ruta interna', () => {
    expect(safeInternalPath('/admin/citas')).toBe('/admin/citas');
  });

  it('cae al fallback si no hay valor', () => {
    expect(safeInternalPath(null)).toBe('/');
    expect(safeInternalPath(undefined)).toBe('/');
    expect(safeInternalPath('')).toBe('/');
  });

  it('rechaza URLs absolutas (open redirect)', () => {
    expect(safeInternalPath('https://sitio-falso.com')).toBe('/');
    expect(safeInternalPath('http://sitio-falso.com/login')).toBe('/');
  });

  it('rechaza rutas protocol-relative', () => {
    expect(safeInternalPath('//sitio-falso.com')).toBe('/');
  });

  it('rechaza rutas con backslash (que algunos navegadores normalizan)', () => {
    expect(safeInternalPath('/\\sitio-falso.com')).toBe('/');
  });

  it('respeta un fallback propio', () => {
    expect(safeInternalPath(null, '/admin')).toBe('/admin');
  });
});
