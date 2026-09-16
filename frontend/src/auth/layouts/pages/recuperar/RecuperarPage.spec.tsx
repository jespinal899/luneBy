import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth/api/auth.actions', () => ({
  forgotPasswordRequest: vi.fn(),
  verifyResetCodeRequest: vi.fn(),
  resetPasswordRequest: vi.fn(),
}));

import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from '@/auth/api/auth.actions';

import { RecuperarPage } from './RecuperarPage';

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecuperarPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

/** Deja la pantalla en el paso del código, que es el punto de partida real. */
const pedirCodigo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Correo'), 'a@b.com');
  await user.click(screen.getByRole('button', { name: /enviarme el código/i }));
  return screen.findByLabelText('Código');
};

describe('RecuperarPage', () => {
  beforeEach(() => {
    vi.mocked(forgotPasswordRequest).mockReset();
    vi.mocked(verifyResetCodeRequest).mockReset();
    vi.mocked(resetPasswordRequest).mockReset();
    vi.mocked(forgotPasswordRequest).mockResolvedValue({ message: 'ok' });
    vi.mocked(verifyResetCodeRequest).mockResolvedValue({ resetToken: 'tok' });
    vi.mocked(resetPasswordRequest).mockResolvedValue({ message: 'ok' });
  });

  it('pide el código para el correo escrito', async () => {
    const user = userEvent.setup();
    renderPage();

    await pedirCodigo(user);

    expect(forgotPasswordRequest).toHaveBeenCalledWith('a@b.com');
  });

  /**
   * El backend responde igual exista o no el correo, para no delatar quién
   * tiene cuenta. La pantalla no debe deshacer eso afirmando que se envió.
   */
  it('no afirma que el código se envió, solo que si hay cuenta llegó', async () => {
    const user = userEvent.setup();
    renderPage();

    await pedirCodigo(user);

    expect(screen.getByText(/tiene una cuenta/i)).toBeInTheDocument();
  });

  it('con el código correcto pasa a elegir la contraseña', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(await pedirCodigo(user), '123456');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(verifyResetCodeRequest).toHaveBeenCalledWith('a@b.com', '123456');
    expect(await screen.findByLabelText('Nueva contraseña')).toBeInTheDocument();
  });

  it('muestra el error si el código no sirve, sin avanzar', async () => {
    vi.mocked(verifyResetCodeRequest).mockRejectedValue(new Error('malo'));
    const user = userEvent.setup();
    renderPage();

    await user.type(await pedirCodigo(user), '000000');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(
      await screen.findByText(/el código no es válido/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  });

  it('cambia la contraseña con el comprobante del paso anterior', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(await pedirCodigo(user), '123456');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await user.type(
      await screen.findByLabelText('Nueva contraseña'),
      'NuevaClave1',
    );
    await user.type(screen.getByLabelText('Repetir contraseña'), 'NuevaClave1');
    await user.click(
      screen.getByRole('button', { name: /cambiar contraseña/i }),
    );

    expect(resetPasswordRequest).toHaveBeenCalledWith('tok', 'NuevaClave1');
  });

  // Es un error de tipeo, no una regla del negocio: se avisa sin ir y volver
  // al servidor, y sobre todo sin quemar el código.
  it('si las contraseñas no coinciden, no llama al servidor', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(await pedirCodigo(user), '123456');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    await user.type(
      await screen.findByLabelText('Nueva contraseña'),
      'NuevaClave1',
    );
    await user.type(screen.getByLabelText('Repetir contraseña'), 'OtraClave1');
    await user.click(
      screen.getByRole('button', { name: /cambiar contraseña/i }),
    );

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
    expect(resetPasswordRequest).not.toHaveBeenCalled();
  });
});
