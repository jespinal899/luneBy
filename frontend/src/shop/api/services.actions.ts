import { http } from '@/api/http';
import type { Service, ServicesPage } from '@/api/types';

export interface ServiceFilters {
  page?: number;
  limit?: number;
  q?: string;
  /** Categorías separadas por coma (valores exactos: "Manicura", "Nail Art"…). */
  categorias?: string;
  /** Banda de precio: "any" | "0-50" | "50-100" | "100-200" | "200+". */
  price?: string;
  /** "name" (alfabético, default) o "recent" (más nuevos primero). */
  sort?: 'name' | 'recent';
}

/** Quita claves vacías / "any" para no ensuciar la query. */
const toParams = (filters: ServiceFilters) => {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || value === 'any') continue;
    params[key] = value as string | number;
  }
  return params;
};

export const getServices = async (filters: ServiceFilters = {}) => {
  const { data } = await http.get<ServicesPage>('/services', {
    params: toParams(filters),
  });
  return data;
};

export const getService = async (term: string) => {
  const { data } = await http.get<Service>(`/services/${term}`);
  return data;
};

// --- Administración ---

export interface ServiceInput {
  name: string;
  price: number;
  category: string;
  durationMin: number;
  description?: string;
  image?: string;
  isActive?: boolean;
  isBookable?: boolean;
}

/**
 * `description`/`image` vacíos se mandan como `null` (no se omiten): así el
 * backend los limpia de verdad en vez de dejar el valor anterior intacto.
 */
const toBody = (input: ServiceInput) => ({
  name: input.name,
  price: input.price,
  category: input.category,
  durationMin: input.durationMin,
  isActive: input.isActive ?? true,
  isBookable: input.isBookable ?? true,
  description: input.description?.trim() || null,
  image: input.image?.trim() || null,
});

export const createService = async (input: ServiceInput) => {
  const { data } = await http.post<Service>('/services', toBody(input));
  return data;
};

export const updateService = async (id: string, input: ServiceInput) => {
  const { data } = await http.patch<Service>(`/services/${id}`, toBody(input));
  return data;
};

export const deleteService = async (id: string) => {
  await http.delete(`/services/${id}`);
};
