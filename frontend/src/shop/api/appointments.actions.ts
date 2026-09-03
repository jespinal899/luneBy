import { http } from '@/api/http';
import type { Appointment } from '@/api/types';

/** Horas de inicio libres ("HH:mm") para una fecha y un servicio. */
export const getAvailability = async (date: string, serviceId: string) => {
  const { data } = await http.get<string[]>('/appointments/availability', {
    params: { date, serviceId },
  });
  return data;
};

export interface CreateAppointmentInput {
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  const { data } = await http.post<Appointment>('/appointments', input);
  return data;
};

export const getMyAppointments = async () => {
  const { data } = await http.get<Appointment[]>('/appointments/me');
  return data;
};

export const cancelAppointment = async (id: string) => {
  const { data } = await http.patch<Appointment>(`/appointments/${id}/cancel`);
  return data;
};
