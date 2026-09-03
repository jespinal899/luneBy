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

// Adjunta el Bearer token en cada petición si existe.
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
