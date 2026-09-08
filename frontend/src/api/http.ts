import axios from 'axios';

const TOKEN_KEY = 'luneby_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
});

const WRITE_METHODS = ['post', 'put', 'patch', 'delete'];

// Adjunta el Bearer token y, en operaciones de escritura, una Idempotency-Key:
// si la petición se reintenta a nivel de red, el backend devuelve la respuesta
// original en vez de ejecutar la operación otra vez.
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method ?? 'get').toLowerCase();
  if (WRITE_METHODS.includes(method) && !config.headers['Idempotency-Key']) {
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
