import { useEffect, useState, type ReactNode } from 'react';

import { tokenStorage } from '@/api/http';
import type { AuthResponse, User } from '@/api/types';
import {
  checkStatusRequest,
  googleLoginRequest,
  loginRequest,
  registerRequest,
  updateProfileRequest,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
} from '../api/auth.actions';
import { AuthContext, type AuthStatus } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>(
    tokenStorage.get() ? 'checking' : 'unauthenticated',
  );
  const [user, setUser] = useState<User | null>(null);

  const applyAuth = ({ user: nextUser, token }: AuthResponse) => {
    tokenStorage.set(token);
    setUser(nextUser);
    setStatus('authenticated');
  };

  const clearAuth = () => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
  };

  // Al montar, si hay token guardado, se revalida contra el backend.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    checkStatusRequest().then(applyAuth).catch(clearAuth);
  }, []);

  const login = async (payload: LoginPayload) => {
    applyAuth(await loginRequest(payload));
  };

  const register = async (payload: RegisterPayload) => {
    applyAuth(await registerRequest(payload));
  };

  const loginWithGoogle = async (idToken: string) => {
    applyAuth(await googleLoginRequest(idToken));
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    applyAuth(await updateProfileRequest(payload));
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isAdmin: user?.roles.includes('admin') ?? false,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout: clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
