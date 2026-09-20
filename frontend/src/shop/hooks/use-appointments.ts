import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelAppointment,
  createAppointment,
  getAvailability,
  getMyAppointments,
  type CreateAppointmentInput,
} from '../api/appointments.actions';

export const useAvailability = (
  date: string | undefined,
  serviceId: string | undefined,
  extraMinutes = 0,
) =>
  useQuery({
    queryKey: ['availability', date, serviceId, extraMinutes],
    queryFn: () =>
      getAvailability(date as string, serviceId as string, extraMinutes),
    staleTime: 15_000, // cambia con cada reserva
    enabled: Boolean(date && serviceId),
  });

export const useMyAppointments = () =>
  useQuery({
    queryKey: ['my-appointments'],
    queryFn: getMyAppointments,
    staleTime: 30_000,
  });

const useInvalidateAppointments = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['availability'] });
    queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
  };
};

/**
 * Reserva una cita.
 *
 * `onCreated` corre dentro del `onSuccess` del hook y no en el de cada
 * llamada a `mutate`: react-query descarta los callbacks por llamada si el
 * componente que los pasó se desmontó mientras la petición viajaba. Perder
 * ese callback significa que la cita queda creada pero la clienta se queda
 * mirando el formulario, sin enterarse.
 */
export const useCreateAppointment = (options?: { onCreated?: () => void }) => {
  const invalidate = useInvalidateAppointments();
  const onCreated = options?.onCreated;

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
    onSuccess: () => {
      invalidate();
      onCreated?.();
    },
  });
};

export const useCancelAppointment = () => {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointment(id, reason),
    onSuccess: invalidate,
  });
};
