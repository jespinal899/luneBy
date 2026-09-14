import axios from 'axios';

const TOKEN_KEY = 'luneby_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const SESSION_COOKIE = 'luneby_session';
// Misma vida que el JWT que emite el backend (JWT_EXPIRES_IN=2h).
const SESSION_MAX_AGE = 2 * 60 * 60;

/**
 * Cookie marcadora de sesión: NO lleva el token ni datos del usuario, solo
 * dice "este navegador tiene una sesión abierta". Existe únicamente para que
 * el Edge Middleware de Vercel (`middleware.ts`) pueda redirigir al login las
 * rutas privadas sin tener que servir primero el shell vacío de la SPA — el
 * servidor no puede leer el `localStorage` donde vive el token real.
 *
 * No es un mecanismo de seguridad: es falsificable a mano y no protege nada
 * por sí sola. La autorización real la hace la API pidiendo el JWT.
 */
export const sessionMarker = {
  set: () => {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secure}`;
  },
  clear: () => {
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
});

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

// Adjunta el Bearer token y, en operaciones de escritura, una Idempotency-Key:
// si la petición se reintenta a nivel de red, el backend devuelve la respuesta
// original en vez de ejecutar la operación otra vez.
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method ?? 'get').toLowerCase();
  if (WRITE_METHODS.has(method) && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
  }
  return config;
});

// Si el backend responde 401, el token dejó de ser válido: lo limpiamos.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) tokenStorage.clear();
    return Promise.reject(error);
  },
);
