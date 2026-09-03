import { overlaps, toHHMM, toMinutes } from './time.helper';

describe('time.helper', () => {
  describe('toMinutes', () => {
    it('convierte "09:00" en 540', () => {
      expect(toMinutes('09:00')).toBe(540);
    });
    it('convierte "10:30" en 630', () => {
      expect(toMinutes('10:30')).toBe(630);
    });
  });

  describe('toHHMM', () => {
    it('convierte 540 en "09:00"', () => {
      expect(toHHMM(540)).toBe('09:00');
    });
    it('rellena con ceros: 75 -> "01:15"', () => {
      expect(toHHMM(75)).toBe('01:15');
    });
    it('es la inversa de toMinutes', () => {
      expect(toHHMM(toMinutes('14:45'))).toBe('14:45');
    });
  });

  describe('overlaps', () => {
    it('detecta solapamiento parcial', () => {
      expect(overlaps(540, 600, 570, 630)).toBe(true);
    });
    it('intervalos contiguos no se solapan (fin == inicio)', () => {
      expect(overlaps(540, 600, 600, 660)).toBe(false);
    });
    it('intervalos disjuntos no se solapan', () => {
      expect(overlaps(540, 600, 660, 720)).toBe(false);
    });
    it('un intervalo contenido en otro sí se solapa', () => {
      expect(overlaps(540, 720, 600, 630)).toBe(true);
    });
  });
});
