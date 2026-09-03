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
) =>
  useQuery({
    queryKey: ['availability', date, serviceId],
    queryFn: () => getAvailability(date as string, serviceId as string),
    enabled: Boolean(date && serviceId),
  });

export const useMyAppointments = () =>
  useQuery({
    queryKey: ['my-appointments'],
    queryFn: getMyAppointments,
  });

const useInvalidateAppointments = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['availability'] });
    queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
  };
};

export const useCreateAppointment = () => {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
    onSuccess: invalidate,
  });
};

export const useCancelAppointment = () => {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: invalidate,
  });
};
