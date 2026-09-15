import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shop/api/site-content.actions', () => ({
  getHero: vi.fn(),
  updateHero: vi.fn(),
}));

import { getHero, updateHero } from '@/shop/api/site-content.actions';

import { AdminContenidoPage } from './AdminContenidoPage';

// A propósito distinta de la portada de respaldo: si fueran iguales, la
// prueba pasaría aunque la pantalla nunca leyera lo guardado.
const guardada = {
  eyebrow: 'Nail bar · San Pedro',
  title: 'Tu estilo, tus reglas',
  subtitle: 'Diseños de autor, cita previa.',
  image: null,
  imageShape: 'vertical' as const,
};

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminContenidoPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminContenidoPage', () => {
  beforeEach(() => {
    vi.mocked(getHero).mockReset();
    vi.mocked(updateHero).mockReset();
    vi.mocked(getHero).mockResolvedValue(guardada);
    vi.mocked(updateHero).mockResolvedValue(guardada);
  });

  it('muestra la portada guardada en el formulario', async () => {
    renderPage();

    expect(await screen.findByDisplayValue(guardada.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(guardada.eyebrow)).toBeInTheDocument();
    expect(screen.getByDisplayValue(guardada.subtitle)).toBeInTheDocument();
  });

  it('guarda lo que escribió la administradora', async () => {
    const user = userEvent.setup();
    renderPage();

    const titulo = await screen.findByLabelText('Título');
    await user.clear(titulo);
    await user.type(titulo, 'Uñas que hablan por vos');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(updateHero).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Uñas que hablan por vos' }),
      ),
    );
  });

  it('confirma que se publicó, para no dejarla con la duda', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue(guardada.title);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/ya se ve en el sitio/i)).toBeInTheDocument();
  });

  // Es lo primero que ve una clienta: si la API falla, la pantalla tiene que
  // seguir siendo usable en vez de quedar en blanco.
  it('si no se puede leer la portada, muestra la de respaldo', async () => {
    vi.mocked(getHero).mockRejectedValue(new Error('sin red'));
    renderPage();

    expect(
      await screen.findByDisplayValue(/tu mejor accesorio de lujo/i),
    ).toBeInTheDocument();
  });

  it('avisa si no se pudo guardar', async () => {
    vi.mocked(updateHero).mockRejectedValue(new Error('falló'));
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue(guardada.title);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(
      await screen.findByText(/no se pudo guardar la portada/i),
    ).toBeInTheDocument();
  });
});
