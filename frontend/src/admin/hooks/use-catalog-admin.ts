import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCatalogItem,
  deleteCatalogItem,
  getCatalogForAdmin,
  updateCatalogItem,
  type CatalogItemInput,
} from '@/shop/api/catalog.actions';
import type { ServiceFilters } from '@/shop/api/services.actions';

/**
 * Catálogo visto desde el panel admin: incluye las entradas ocultas.
 *
 * La queryKey empieza por `catalog` para que el `invalidateQueries` de las
 * mutaciones también refresque este listado.
 */
export const useAdminCatalog = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['catalog', 'admin', filters],
    queryFn: () => getCatalogForAdmin(filters),
  });

const useInvalidateCatalog = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
    queryClient.invalidateQueries({ queryKey: ['catalog-item'] });
  };
};

export const useCreateCatalogItem = () => {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (input: CatalogItemInput) => createCatalogItem(input),
    onSuccess: invalidate,
  });
};

export const useUpdateCatalogItem = (id: string) => {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (input: CatalogItemInput) => updateCatalogItem(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteCatalogItem = () => {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (id: string) => deleteCatalogItem(id),
    onSuccess: invalidate,
  });
};
