import { http } from '@/api/http';
import type { Appointment } from '@/api/types';

/** Horas de inicio libres ("HH:mm") para una fecha y una duración total. */
export const getAvailability = async (
  date: string,
  serviceId: string,
  extraMinutes = 0,
) => {
  const { data } = await http.get<string[]>('/appointments/availability', {
    params: { date, serviceId, extraMinutes },
  });
  return data;
};

export interface CreateAppointmentInput {
  /** Servicios elegidos, en el orden en que se añadieron. */
  serviceIds: string[];
  /**
   * Diseños elegidos, para los servicios que se agregaron desde el catálogo.
   * El backend congela el nombre y el precio del diseño en la cita.
   */
  catalogItemIds?: string[];
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

/** El motivo es opcional: se manda solo si la clienta escribió algo. */
export const cancelAppointment = async (id: string, reason?: string) => {
  const { data } = await http.patch<Appointment>(
    `/appointments/${id}/cancel`,
    reason ? { reason } : {},
  );
  return data;
};
