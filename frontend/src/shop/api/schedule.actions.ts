import { http } from '@/api/http';
import type { WeeklyScheduleDay } from '@/api/types';

/** Horario semanal vigente (público, sin autenticación). */
export const getPublicSchedule = async () => {
  const { data } = await http.get<WeeklyScheduleDay[]>(
    '/appointments/schedule/public',
  );
  return data;
};
