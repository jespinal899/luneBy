import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { tokenStorage } from '@/api/http';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './use-auth';

vi.mock('../api/auth.actions', () => ({
  checkStatusRequest: vi.fn(),
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  googleLoginRequest: vi.fn(),
  updateProfileRequest: vi.fn(),
}));

import {
  checkStatusRequest,
  loginRequest,
} from '../api/auth.actions';

const Probe = () => {
  const { status, user, isAdmin, login } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.email ?? 'sin-usuario'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button
        onClick={() => login({ email: 'a@b.com', password: 'x' })}
      >
        login
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(checkStatusRequest).mockReset();
    vi.mocked(loginRequest).mockReset();
  });

  it('arranca "unauthenticated" cuando no hay token guardado', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('sin-usuario');
  });

  it('con token guardado, revalida y pasa a "authenticated"', async () => {
    tokenStorage.set('tok-1');
    vi.mocked(checkStatusRequest).mockResolvedValue({
      token: 'tok-1',
      user: { id: '1', email: 'kelin@example.com', roles: ['admin'] } as never,
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('kelin@example.com');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
  });

  it('si la revalidación falla, limpia el token y queda "unauthenticated"', async () => {
    tokenStorage.set('tok-viejo');
    vi.mocked(checkStatusRequest).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent(
        'unauthenticated',
      ),
    );
    expect(tokenStorage.get()).toBeNull();
  });

  it('al autenticarse deja la cookie marcadora y al fallar la borra', async () => {
    tokenStorage.set('tok-1');
    vi.mocked(checkStatusRequest).mockResolvedValue({
      token: 'tok-1',
      user: { id: '1', email: 'kelin@example.com', roles: ['admin'] } as never,
    });

    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(document.cookie).toContain('luneby_session=1');

    unmount();
    localStorage.clear();
    tokenStorage.set('tok-viejo');
    vi.mocked(checkStatusRequest).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(document.cookie).not.toContain('luneby_session=1'));
  });

  it('login() guarda el token y el usuario', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      token: 'tok-nuevo',
      user: { id: '2', email: 'a@b.com', roles: [] } as never,
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    screen.getByText('login').click();

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(tokenStorage.get()).toBe('tok-nuevo');
  });
});
