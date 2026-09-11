import { useQuery } from '@tanstack/react-query';

import { getPublicSchedule } from '../api/schedule.actions';

// Casi no cambia: 5 min sin refetch.
const SCHEDULE_STALE_TIME = 5 * 60_000;

/** Horario semanal vigente del salón (footer, página de contacto). */
export const useSalonSchedule = () =>
  useQuery({
    queryKey: ['salon-schedule'],
    queryFn: getPublicSchedule,
    staleTime: SCHEDULE_STALE_TIME,
  });
