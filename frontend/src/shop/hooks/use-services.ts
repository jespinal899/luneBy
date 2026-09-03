import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getService,
  getServices,
  type ServiceFilters,
} from '../api/services.actions';

export const useServices = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['services', filters],
    queryFn: () => getServices(filters),
    placeholderData: keepPreviousData, // no parpadea al cambiar de página/filtro
  });

export const useService = (term: string | undefined) =>
  useQuery({
    queryKey: ['service', term],
    queryFn: () => getService(term as string),
    enabled: Boolean(term),
  });
