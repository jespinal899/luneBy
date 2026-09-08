import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getService,
  getServices,
  type ServiceFilters,
} from '../api/services.actions';

// El catálogo casi nunca cambia: 5 min sin refetch.
const CATALOG_STALE_TIME = 5 * 60_000;

export const useServices = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['services', filters],
    queryFn: () => getServices(filters),
    staleTime: CATALOG_STALE_TIME,
    placeholderData: keepPreviousData, // no parpadea al cambiar de página/filtro
  });

export const useService = (term: string | undefined) =>
  useQuery({
    queryKey: ['service', term],
    queryFn: () => getService(term as string),
    staleTime: CATALOG_STALE_TIME,
    enabled: Boolean(term),
  });
