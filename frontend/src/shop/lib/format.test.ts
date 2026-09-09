import { describe, expect, it } from 'vitest';

import { formatDuration, formatLps } from './format';

describe('formatLps', () => {
  it('formatea montos en Lempiras sin decimales', () => {
    expect(formatLps(1200)).toBe('L. 1,200');
    expect(formatLps(0)).toBe('L. 0');
  });

  it('redondea al entero más cercano', () => {
    expect(formatLps(1199.6)).toBe('L. 1,200');
  });
});

describe('formatDuration', () => {
  it('muestra solo minutos por debajo de una hora', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('muestra horas y minutos', () => {
    expect(formatDuration(135)).toBe('2 h 15 min');
  });

  it('omite los minutos en horas exactas', () => {
    expect(formatDuration(120)).toBe('2 h');
  });
});
