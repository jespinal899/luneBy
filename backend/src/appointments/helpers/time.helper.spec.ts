import {
  nowInSalon,
  overlaps,
  toHHMM,
  toMinutes,
  weekdayOf,
} from './time.helper';

describe('time.helper', () => {
  describe('weekdayOf', () => {
    it('devuelve el día correcto sin depender de la zona del servidor', () => {
      expect(weekdayOf('2026-09-14')).toBe(1); // lunes
      expect(weekdayOf('2026-09-13')).toBe(0); // domingo
      expect(weekdayOf('2026-09-19')).toBe(6); // sábado
    });
  });

  describe('nowInSalon', () => {
    // El salón está en UTC−6. Estos casos son las dos fallas reales que tenía
    // el cálculo anterior, que mezclaba la fecha en UTC con la hora del
    // servidor.

    it('a las 8 de la noche en Honduras sigue siendo el mismo día (en UTC ya es el siguiente)', () => {
      // 2026-09-15T02:00Z === 2026-09-14, 20:00 en Choloma.
      const { date, minutes } = nowInSalon(new Date('2026-09-15T02:00:00Z'));

      expect(date).toBe('2026-09-14');
      expect(minutes).toBe(20 * 60);
    });

    it('a las 9 de la mañana en Honduras devuelve 9, no las 15 del servidor en UTC', () => {
      // 2026-09-14T15:00Z === 2026-09-14, 09:00 en Choloma.
      const { date, minutes } = nowInSalon(new Date('2026-09-14T15:00:00Z'));

      expect(date).toBe('2026-09-14');
      expect(minutes).toBe(9 * 60);
    });

    it('maneja la medianoche del salón como minuto 0', () => {
      // 2026-09-14T06:00Z === 2026-09-14, 00:00 en Choloma.
      const { date, minutes } = nowInSalon(new Date('2026-09-14T06:00:00Z'));

      expect(date).toBe('2026-09-14');
      expect(minutes).toBe(0);
    });
  });

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
