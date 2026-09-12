import { useQuery } from '@tanstack/react-query';

import {
  getServicesForAdmin,
  type ServiceFilters,
} from '@/shop/api/services.actions';

/**
 * Catálogo visto desde el panel admin: incluye los servicios ocultos.
 *
 * La queryKey empieza por `services` a propósito, para que el
 * `invalidateQueries({ queryKey: ['services'] })` de las mutaciones también
 * refresque este listado.
 */
export const useAdminServices = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['services', 'admin', filters],
    queryFn: () => getServicesForAdmin(filters),
  });
