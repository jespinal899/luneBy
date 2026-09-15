import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tokenStorage } from '@/api/http';
import { AuthProvider } from '@/auth/context/AuthProvider';
import { QuoteProvider } from '@/quote/QuoteProvider';

vi.mock('@/auth/api/auth.actions', () => ({
  checkStatusRequest: vi.fn(),
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  googleLoginRequest: vi.fn(),
  updateProfileRequest: vi.fn(),
}));

import { checkStatusRequest } from '@/auth/api/auth.actions';

import { CustomHeader } from './CustomHeader';

const renderHeader = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <QuoteProvider>
            <CustomHeader />
          </QuoteProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('CustomHeader — sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(checkStatusRequest).mockReset();
  });

  /**
   * El parpadeo: al recargar, una clienta ya autenticada veía por un instante
   * el botón de "Iniciar sesión" mientras se revalidaba su token.
   */
  it('no ofrece iniciar sesión mientras revalida el token', () => {
    tokenStorage.set('un-token-guardado');
    vi.mocked(checkStatusRequest).mockReturnValue(new Promise(() => {}));

    renderHeader();

    expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument();
  });

  it('sin token guardado, ofrece iniciar sesión de entrada', () => {
    renderHeader();

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    // Ni siquiera se pregunta al backend: no hay nada que revalidar.
    expect(checkStatusRequest).not.toHaveBeenCalled();
  });

  it('cuando el token resulta inválido, vuelve a ofrecer iniciar sesión', async () => {
    tokenStorage.set('un-token-vencido');
    vi.mocked(checkStatusRequest).mockRejectedValue(new Error('401'));

    renderHeader();

    expect(await screen.findByText('Iniciar sesión')).toBeInTheDocument();
  });
});
