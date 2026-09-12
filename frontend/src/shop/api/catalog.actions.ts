import { http } from '@/api/http';
import type { CatalogItem, CatalogPage } from '@/api/types';
import { toParams, type ServiceFilters } from './services.actions';

/** Catálogo público: entradas visibles de servicios disponibles. */
export const getCatalog = async (filters: ServiceFilters = {}) => {
  const { data } = await http.get<CatalogPage>('/catalog', {
    params: toParams(filters),
  });
  return data;
};

export const getCatalogItem = async (id: string) => {
  const { data } = await http.get<CatalogItem>(`/catalog/${id}`);
  return data;
};

// --- Administración ---

/** Listado del panel admin: incluye las entradas ocultas. */
export const getCatalogForAdmin = async (filters: ServiceFilters = {}) => {
  const { data } = await http.get<CatalogPage>('/catalog/admin/all', {
    params: toParams(filters),
  });
  return data;
};

export interface CatalogItemInput {
  serviceId: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * `description`/`image` vacíos se mandan como `null` (no se omiten): así el
 * backend los limpia de verdad en vez de dejar el valor anterior.
 */
const toBody = (input: CatalogItemInput) => ({
  serviceId: input.serviceId,
  isActive: input.isActive ?? true,
  description: input.description?.trim() || null,
  image: input.image?.trim() || null,
});

export const createCatalogItem = async (input: CatalogItemInput) => {
  const { data } = await http.post<CatalogItem>('/catalog', toBody(input));
  return data;
};

export const updateCatalogItem = async (
  id: string,
  input: CatalogItemInput,
) => {
  const { data } = await http.patch<CatalogItem>(
    `/catalog/${id}`,
    toBody(input),
  );
  return data;
};

export const deleteCatalogItem = async (id: string) => {
  await http.delete(`/catalog/${id}`);
};
