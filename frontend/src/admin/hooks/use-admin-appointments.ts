import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AppointmentStatus } from '@/api/types';
import {
  getAppointments,
  updateAppointmentStatus,
  type AppointmentFilters,
} from '../api/appointments.actions';

export const useAdminAppointments = (filters: AppointmentFilters = {}) =>
  useQuery({
    queryKey: ['admin-appointments', filters],
    queryFn: () => getAppointments(filters),
  });

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
    },
  });
};
