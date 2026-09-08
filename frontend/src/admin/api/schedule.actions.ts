import { http } from '@/api/http';

export interface ScheduleDay {
  weekday: number; // 0 = domingo ... 6 = sábado
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
}

export interface TimeOff {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export const getSchedule = async () => {
  const { data } = await http.get<ScheduleDay[]>('/appointments/schedule');
  return data;
};

export const replaceSchedule = async (days: ScheduleDay[]) => {
  const { data } = await http.put<ScheduleDay[]>('/appointments/schedule', {
    days,
  });
  return data;
};

export const getTimeOff = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await http.get<TimeOff[]>('/appointments/time-off', {
    params: { from: today },
  });
  return data;
};

export const addTimeOff = async (payload: {
  date: string;
  reason?: string;
}) => {
  const { data } = await http.post<TimeOff>('/appointments/time-off', payload);
  return data;
};

export const removeTimeOff = async (id: string) => {
  await http.delete(`/appointments/time-off/${id}`);
};
