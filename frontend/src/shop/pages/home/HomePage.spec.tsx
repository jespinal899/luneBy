import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shop/api/site-content.actions', () => ({
  getHero: vi.fn(),
  updateHero: vi.fn(),
}));
vi.mock('@/shop/api/catalog.actions', () => ({
  getCatalog: vi.fn(),
}));

import { getCatalog } from '@/shop/api/catalog.actions';
import { getHero } from '@/shop/api/site-content.actions';

import { HomePage } from './HomePage';

const renderHome = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('HomePage — portada editable', () => {
  beforeEach(() => {
    vi.mocked(getHero).mockReset();
    vi.mocked(getCatalog).mockResolvedValue({
      products: [],
      count: 0,
      page: 1,
      pages: 0,
    } as never);
  });

  it('muestra los textos que guardó la administradora', async () => {
    vi.mocked(getHero).mockResolvedValue({
      eyebrow: 'Nail bar · San Pedro',
      title: 'Tu estilo, tus reglas',
      subtitle: 'Diseños de autor, cita previa.',
      image: null,
    });

    renderHome();

    expect(
      await screen.findByRole('heading', { name: 'Tu estilo, tus reglas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nail bar · San Pedro')).toBeInTheDocument();
  });

  it('usa la foto subida cuando hay una', async () => {
    vi.mocked(getHero).mockResolvedValue({
      eyebrow: 'a',
      title: 'b',
      subtitle: 'c',
      image: 'https://cdn.test/portada.webp',
    });

    renderHome();

    // La foto de respaldo se pinta primero: hay que esperar a que llegue la
    // portada guardada, no basta con encontrar la etiqueta.
    await waitFor(() => {
      const [foto] = screen.getAllByRole('img');
      expect(foto).toHaveAttribute('src', 'https://cdn.test/portada.webp');
    });
  });

  // La portada es lo primero que ve una clienta: si la API no responde, tiene
  // que verse el texto con el que salió el sitio, nunca un hueco en blanco.
  it('si la API falla, muestra la portada de respaldo', async () => {
    vi.mocked(getHero).mockRejectedValue(new Error('sin red'));

    renderHome();

    expect(
      await screen.findByRole('heading', {
        name: /tu mejor accesorio de lujo/i,
      }),
    ).toBeInTheDocument();
  });
});
