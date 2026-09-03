import { http } from '@/api/http';
import type { AuthResponse } from '@/api/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload) => {
  const { data } = await http.post<AuthResponse>('/auth/register', payload);
  return data;
};

/** Revalida el token guardado y devuelve el usuario + un token fresco. */
export const checkStatusRequest = async () => {
  const { data } = await http.get<AuthResponse>('/auth/check-status');
  return data;
};
