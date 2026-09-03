/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API del backend. Ej: http://localhost:3001/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
