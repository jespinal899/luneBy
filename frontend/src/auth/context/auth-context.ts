import { createContext } from 'react';

import type { User } from '@/api/types';
import type { LoginPayload, RegisterPayload } from '../api/auth.actions';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
