import { useQuery } from '@tanstack/react-query';

import { getCatalog, getCatalogItem } from '../api/catalog.actions';
import type { ServiceFilters } from '../api/services.actions';

// El catálogo casi no cambia: 5 min sin refetch.
const CATALOG_STALE_TIME = 5 * 60_000;

export const useCatalog = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['catalog', filters],
    queryFn: () => getCatalog(filters),
    staleTime: CATALOG_STALE_TIME,
  });

export const useCatalogItem = (id: string | undefined) =>
  useQuery({
    queryKey: ['catalog-item', id],
    queryFn: () => getCatalogItem(id as string),
    staleTime: CATALOG_STALE_TIME,
    enabled: Boolean(id),
  });
