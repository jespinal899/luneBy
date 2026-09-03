import { http } from '@/api/http';

/** Sube una imagen de servicio (solo admin) y devuelve su URL pública. */
export const uploadServiceImage = async (file: File) => {
  const body = new FormData();
  body.append('file', file);
  const { data } = await http.post<{ url: string }>('/files/service', body);
  return data.url;
};
