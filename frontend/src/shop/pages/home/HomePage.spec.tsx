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
    // La portada se guarda en el navegador para no parpadear al recargar; sin
    // esto, una prueba arrancaría con la portada que dejó la anterior.
    localStorage.clear();
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
      imageShape: 'vertical' as const,
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
      imageShape: 'horizontal' as const,
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

  // El parpadeo al recargar: se veía el texto de respaldo y al instante el
  // guardado. Ahora, mientras no se sabe cuál va, no se pinta ninguno.
  it('no muestra el texto de respaldo mientras espera la respuesta', async () => {
    let responder: (hero: unknown) => void = () => {};
    vi.mocked(getHero).mockReturnValue(
      new Promise((resolve) => {
        responder = resolve;
      }) as never,
    );

    renderHome();

    expect(
      screen.queryByText(/tu mejor accesorio de lujo/i),
    ).not.toBeInTheDocument();

    responder({
      eyebrow: 'a',
      title: 'Tu estilo, tus reglas',
      subtitle: 'c',
      image: null,
      imageShape: 'vertical',
    });

    expect(
      await screen.findByRole('heading', { name: 'Tu estilo, tus reglas' }),
    ).toBeInTheDocument();
  });

  // Al recargar, la portada correcta tiene que estar en el primer cuadro; si
  // hubiera que esperar a la API, volvería el parpadeo.
  it('pinta de entrada la última portada que vio este navegador', () => {
    localStorage.setItem(
      'luneby:hero',
      JSON.stringify({
        eyebrow: 'a',
        title: 'Lo que vio la última vez',
        subtitle: 'c',
        image: null,
        imageShape: 'vertical',
      }),
    );
    vi.mocked(getHero).mockReturnValue(new Promise(() => {}) as never);

    renderHome();

    expect(
      screen.getByRole('heading', { name: 'Lo que vio la última vez' }),
    ).toBeInTheDocument();
  });

  // La foto ya no se muestra siempre vertical: si está tomada apaisada, se
  // recorta y se muestra apaisada.
  it('respeta la forma elegida para la foto', async () => {
    vi.mocked(getHero).mockResolvedValue({
      eyebrow: 'a',
      title: 'b',
      subtitle: 'c',
      image: 'https://cdn.test/portada.webp',
      imageShape: 'horizontal' as const,
    });

    renderHome();

    await waitFor(() => {
      const [foto] = screen.getAllByRole('img');
      expect(foto.className).toContain('aspect-[4/3]');
    });
  });

  // Una forma guardada por una versión posterior no debe dejar la portada sin
  // proporción y descuadrar el diseño.
  it('ante una forma desconocida, vuelve a la vertical', async () => {
    vi.mocked(getHero).mockResolvedValue({
      eyebrow: 'a',
      title: 'b',
      subtitle: 'c',
      image: 'https://cdn.test/portada.webp',
      imageShape: 'panoramica' as never,
    });

    renderHome();

    await waitFor(() => {
      const [foto] = screen.getAllByRole('img');
      expect(foto.className).toContain('aspect-[4/5]');
    });
  });
});
