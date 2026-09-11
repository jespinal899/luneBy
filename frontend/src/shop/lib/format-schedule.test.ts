import { describe, expect, it } from 'vitest';

import type { WeeklyScheduleDay } from '@/api/types';
import { formatScheduleLines } from './format-schedule';

const day = (
  weekday: number,
  startTime: string,
  endTime: string,
  isActive = true,
): WeeklyScheduleDay => ({ weekday, startTime, endTime, isActive });

describe('formatScheduleLines', () => {
  it('agrupa días consecutivos con el mismo horario', () => {
    const schedule: WeeklyScheduleDay[] = [
      day(1, '17:30', '22:00'),
      day(2, '17:30', '22:00'),
      day(3, '17:30', '22:00'),
      day(4, '17:30', '22:00'),
      day(5, '16:30', '22:00'),
      day(6, '13:00', '22:00'),
      day(0, '13:00', '22:00'),
    ];

    expect(formatScheduleLines(schedule)).toEqual([
      { days: 'Lunes a Jueves', time: '5:30 p. m. – 10 p. m.' },
      { days: 'Viernes', time: '4:30 p. m. – 10 p. m.' },
      { days: 'Sábado a Domingo', time: '1 p. m. – 10 p. m.' },
    ]);
  });

  it('omite los días cerrados', () => {
    const schedule: WeeklyScheduleDay[] = [
      day(1, '09:00', '18:00'),
      day(0, '09:00', '18:00', false),
    ];

    expect(formatScheduleLines(schedule)).toEqual([
      { days: 'Lunes', time: '9 a. m. – 6 p. m.' },
    ]);
  });

  it('no fusiona días separados por uno cerrado', () => {
    const schedule: WeeklyScheduleDay[] = [
      day(1, '09:00', '18:00'),
      day(2, '09:00', '18:00', false),
      day(3, '09:00', '18:00'),
    ];

    expect(formatScheduleLines(schedule)).toEqual([
      { days: 'Lunes', time: '9 a. m. – 6 p. m.' },
      { days: 'Miércoles', time: '9 a. m. – 6 p. m.' },
    ]);
  });
});
