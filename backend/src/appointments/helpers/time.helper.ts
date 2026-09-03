/** Minutos transcurridos desde medianoche para un "HH:mm". */
export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Convierte minutos desde medianoche a "HH:mm". */
export const toHHMM = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** ¿Se solapan los intervalos [aStart, aEnd) y [bStart, bEnd)? (en minutos) */
export const overlaps = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean => aStart < bEnd && bStart < aEnd;
