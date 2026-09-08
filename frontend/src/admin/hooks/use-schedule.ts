import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addTimeOff,
  getSchedule,
  getTimeOff,
  removeTimeOff,
  replaceSchedule,
  type ScheduleDay,
} from '../api/schedule.actions';

export const useSchedule = () =>
  useQuery({ queryKey: ['schedule'], queryFn: getSchedule, staleTime: 60_000 });

export const useReplaceSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (days: ScheduleDay[]) => replaceSchedule(days),
    onSuccess: (data) => {
      qc.setQueryData(['schedule'], data);
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

export const useTimeOff = () =>
  useQuery({ queryKey: ['time-off'], queryFn: getTimeOff, staleTime: 60_000 });

export const useAddTimeOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { date: string; reason?: string }) =>
      addTimeOff(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-off'] });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};

export const useRemoveTimeOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeTimeOff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-off'] });
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
};
