import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createService,
  deleteService,
  updateService,
  type ServiceInput,
} from '@/shop/api/services.actions';

const useInvalidateServices = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['service'] });
  };
};

export const useCreateService = () => {
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (input: ServiceInput) => createService(input),
    onSuccess: invalidate,
  });
};

export const useUpdateService = (id: string) => {
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (input: ServiceInput) => updateService(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteService = () => {
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: invalidate,
  });
};
