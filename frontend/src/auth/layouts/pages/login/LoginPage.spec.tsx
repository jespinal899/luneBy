import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LoginPage } from './LoginPage';

const login = vi.fn();
const loginWithGoogle = vi.fn();

vi.mock('@/auth/context/use-auth', () => ({
  useAuth: () => ({ login, loginWithGoogle }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
    loginWithGoogle.mockReset();
    login.mockResolvedValue(undefined);
  });

  it('envía email y contraseña al hacer submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'kelin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(login.mock.calls[0][0]).toEqual({
      email: 'kelin@example.com',
      password: 'secreta123',
    });
  });

  it('muestra un mensaje de error si el login falla', async () => {
    login.mockRejectedValue(new Error('credenciales inválidas'));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'kelin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'mala-clave');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(
      await screen.findByText('No se pudo iniciar sesión.'),
    ).toBeInTheDocument();
  });
});
