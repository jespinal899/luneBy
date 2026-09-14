import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { RegisterPage } from './RegisterPage';

const register = vi.fn();
const loginWithGoogle = vi.fn();

vi.mock('@/auth/context/use-auth', () => ({
  useAuth: () => ({ register, loginWithGoogle }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    register.mockReset();
    loginWithGoogle.mockReset();
    register.mockResolvedValue(undefined);
  });

  it('envía los datos del formulario sin teléfono si se deja vacío', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Kelin Ramírez');
    await user.type(screen.getByLabelText('Correo'), 'kelin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(register.mock.calls[0][0]).toEqual({
      fullName: 'Kelin Ramírez',
      email: 'kelin@example.com',
      password: 'secreta123',
    });
  });

  it('incluye el teléfono cuando se completa', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Kelin Ramírez');
    await user.type(screen.getByLabelText('Correo'), 'kelin@example.com');
    await user.type(
      screen.getByLabelText('Teléfono (opcional)'),
      '+1 809 000 0000',
    );
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(register.mock.calls[0][0]).toEqual(
      expect.objectContaining({ phone: '+1 809 000 0000' }),
    );
  });

  it('muestra un mensaje de error si el registro falla', async () => {
    register.mockRejectedValue(new Error('correo ya existe'));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Kelin Ramírez');
    await user.type(screen.getByLabelText('Correo'), 'kelin@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(
      await screen.findByText('No se pudo crear la cuenta.'),
    ).toBeInTheDocument();
  });
});
