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
}

/** Quita descripción/imagen vacías (la API valida `image` como URL). */
const toBody = (input: ServiceInput) => {
  const body: Record<string, unknown> = {
    name: input.name,
    price: input.price,
    category: input.category,
    durationMin: input.durationMin,
    isActive: input.isActive ?? true,
  };
  if (input.description?.trim()) body.description = input.description.trim();
  if (input.image?.trim()) body.image = input.image.trim();
  return body;
};

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
