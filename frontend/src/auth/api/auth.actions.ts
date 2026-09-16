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

/** Inicia sesión o crea la cuenta con el ID token de Google. */
export const googleLoginRequest = async (idToken: string) => {
  const { data } = await http.post<AuthResponse>('/auth/google', { idToken });
  return data;
};

/** Revalida el token guardado y devuelve el usuario + un token fresco. */
export const checkStatusRequest = async () => {
  const { data } = await http.get<AuthResponse>('/auth/check-status');
  return data;
};

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const { data } = await http.patch<AuthResponse>('/auth/profile', payload);
  return data;
};

export const changePasswordRequest = async (payload: ChangePasswordPayload) => {
  const { data } = await http.patch<{ message: string }>(
    '/auth/password',
    payload,
  );
  return data;
};

// --- Recuperación de contraseña ---

/**
 * Paso 1: pide el código.
 *
 * Responde lo mismo exista o no el correo, a propósito: si respondiera
 * distinto, el formulario serviría para averiguar quién tiene cuenta.
 */
export const forgotPasswordRequest = async (email: string) => {
  const { data } = await http.post<{ message: string }>(
    '/auth/forgot-password',
    { email },
  );
  return data;
};

/** Paso 2: comprueba el código y devuelve el comprobante del paso 3. */
export const verifyResetCodeRequest = async (email: string, code: string) => {
  const { data } = await http.post<{ resetToken: string }>(
    '/auth/verify-reset-code',
    { email, code },
  );
  return data;
};

/** Paso 3: guarda la contraseña nueva. */
export const resetPasswordRequest = async (
  resetToken: string,
  newPassword: string,
) => {
  const { data } = await http.post<{ message: string }>('/auth/reset-password', {
    resetToken,
    newPassword,
  });
  return data;
};
