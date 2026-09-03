// Tipos compartidos con la API del backend (Luné by Kelin).

export type Role = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isActive: boolean;
  roles: Role[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
