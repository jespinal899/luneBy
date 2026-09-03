import { http } from '@/api/http';
import type { Appointment, AppointmentStatus } from '@/api/types';

export interface AppointmentFilters {
  date?: string;
  status?: AppointmentStatus;
}

/** Agenda completa (solo admin). */
export const getAppointments = async (filters: AppointmentFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.date) params.date = filters.date;
  if (filters.status) params.status = filters.status;

  const { data } = await http.get<Appointment[]>('/appointments', { params });
  return data;
};

export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus,
) => {
  const { data } = await http.patch<Appointment>(`/appointments/${id}/status`, {
    status,
  });
  return data;
};
