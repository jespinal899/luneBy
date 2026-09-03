import { AxiosError } from 'axios';

/** Extrae un mensaje legible del error que devuelve la API de NestJS. */
export const apiErrorMessage = (
  error: unknown,
  fallback = 'Algo salió mal, inténtalo de nuevo.',
): string => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) return String(message[0]);
    if (typeof message === 'string') return message;
  }
  return fallback;
};
