import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../context/use-auth';

interface Props {
  children: ReactNode;
  /** Si se indica "admin", además exige el rol admin. */
  role?: 'admin';
}

export const ProtectedRoute = ({ children, role }: Props) => {
  const { status, isAdmin } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
