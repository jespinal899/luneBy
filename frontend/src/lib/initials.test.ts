import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
  it('toma la primera y la última inicial de un nombre completo', () => {
    expect(initials('Kelin Rodríguez')).toBe('KR');
  });

  it('con un solo nombre usa sus dos primeras letras', () => {
    expect(initials('Kelin')).toBe('KE');
  });

  it('ignora los paréntesis tipo "(Admin)"', () => {
    expect(initials('Kelin (Admin)')).toBe('KE');
    expect(initials('Ana Paz (Admin)')).toBe('AP');
  });

  it('devuelve "?" cuando no hay nombre utilizable', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });
});
