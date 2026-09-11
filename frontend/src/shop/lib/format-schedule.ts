import type { WeeklyScheduleDay } from '@/api/types';

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
// Orden de despliegue: semana empieza en lunes, domingo al final.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** `"17:30"` → `"5:30 p. m."` */
const formatClock = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h < 12 ? 'a. m.' : 'p. m.';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

export interface ScheduleLine {
  days: string;
  time: string;
}

/**
 * Agrupa días consecutivos con el mismo horario en líneas legibles, ej.
 * "Lunes a jueves: 5:30 p. m. – 10:00 p. m.". Los días cerrados no se listan.
 */
export const formatScheduleLines = (
  schedule: WeeklyScheduleDay[],
): ScheduleLine[] => {
  const byWeekday = new Map(schedule.map((d) => [d.weekday, d]));
  const ordered = DISPLAY_ORDER.map((w) => byWeekday.get(w)).filter(
    (d): d is WeeklyScheduleDay => Boolean(d?.isActive),
  );

  const lines: ScheduleLine[] = [];
  for (const day of ordered) {
    const last = lines[lines.length - 1];
    const sameHours =
      last && last.time === `${formatClock(day.startTime)} – ${formatClock(day.endTime)}`;

    if (sameHours && isConsecutive(day, byWeekday)) {
      last.days = `${last.days.split(' a ')[0]} a ${DAY_NAMES[day.weekday]}`;
    } else {
      lines.push({
        days: DAY_NAMES[day.weekday],
        time: `${formatClock(day.startTime)} – ${formatClock(day.endTime)}`,
      });
    }
  }
  return lines;
};

// Comprueba que el día anterior en DISPLAY_ORDER también quedó en esa línea
// (evita fusionar, por ejemplo, un sábado con un lunes de otra semana).
function isConsecutive(
  day: WeeklyScheduleDay,
  byWeekday: Map<number, WeeklyScheduleDay>,
): boolean {
  const idx = DISPLAY_ORDER.indexOf(day.weekday);
  if (idx <= 0) return false;
  const prevWeekday = DISPLAY_ORDER[idx - 1];
  const prev = byWeekday.get(prevWeekday);
  return Boolean(prev?.isActive);
}
