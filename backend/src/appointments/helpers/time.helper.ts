/**
 * Zona horaria del salón. El negocio está en Choloma, Cortés (UTC−6, sin
 * horario de verano), pero el contenedor de la API corre en UTC. Todo lo que
 * signifique "¿qué hora es ahora para Kelin?" tiene que calcularse acá, no con
 * la hora del servidor.
 */
export const SALON_TIME_ZONE = 'America/Tegucigalpa';

/**
 * Día de la semana (0 = domingo) de una fecha "YYYY-MM-DD".
 *
 * Se construye en UTC a propósito: `new Date('2026-09-14T00:00:00')` se
 * interpreta en la zona del servidor, así que el día podía cambiar según dónde
 * estuviera desplegada la API. Partiendo la cadena el resultado es el mismo
 * siempre.
 */
export const weekdayOf = (isoDate: string): number => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

/**
 * "Ahora" visto desde el salón: la fecha del día ("YYYY-MM-DD") y los minutos
 * transcurridos desde su medianoche.
 *
 * Antes esto mezclaba dos relojes —`toISOString()` da la fecha en UTC y
 * `getHours()` la hora del servidor—, así que a las 8 de la noche de Honduras
 * el sistema ya creía estar en el día siguiente y ofrecía turnos que ya habían
 * pasado, y a las 9 de la mañana creía que eran las 3 de la tarde y escondía
 * toda la mañana disponible.
 *
 * `now` se puede inyectar para poder probarlo con una hora fija.
 */
export const nowInSalon = (
  now: Date = new Date(),
): {
  date: string;
  minutes: number;
} => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '0';

  // Algunos entornos devuelven "24" para la medianoche con hour12:false.
  const hour = Number(get('hour')) % 24;

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + Number(get('minute')),
  };
};

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
