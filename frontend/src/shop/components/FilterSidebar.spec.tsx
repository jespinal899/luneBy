import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shop/api/services.actions', () => ({
  getServices: vi.fn(),
}));

import { getServices } from '@/shop/api/services.actions';

import { FilterSidebar } from './FilterSidebar';

const servicio = (id: string, name: string) => ({
  id,
  name,
  slug: name.toLowerCase(),
  price: 350,
  durationMin: 45,
  category: 'Manos',
  isActive: true,
});

/** Expone la query string, que es todo el efecto observable del componente. */
const QueryProbe = () => {
  const { search } = useLocation();
  return <span data-testid="query">{search}</span>;
};

const query = () => screen.getByTestId('query').textContent;

const renderSidebar = (initial = '/tienda') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initial]}>
        <FilterSidebar />
        <QueryProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('FilterSidebar', () => {
  beforeEach(() => {
    vi.mocked(getServices).mockResolvedValue({
      products: [servicio('svc-1', 'Esmaltado'), servicio('svc-2', 'Acrílico')],
      count: 2,
      page: 1,
      pages: 1,
    } as never);
  });

  it('lista los servicios que define la administradora, no una lista fija', async () => {
    renderSidebar();

    expect(await screen.findByRole('button', { name: 'Esmaltado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acrílico' })).toBeInTheDocument();
  });

  it('al elegir un servicio lo agrega a la query y vuelve a la página 1', async () => {
    renderSidebar('/tienda?page=4');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Esmaltado' }));

    expect(query()).toContain('servicios=svc-1');
    expect(query()).toContain('page=1');
  });

  it('acumula varios servicios separados por coma', async () => {
    renderSidebar();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Esmaltado' }));
    await user.click(screen.getByRole('button', { name: 'Acrílico' }));

    expect(decodeURIComponent(query() ?? '')).toContain('servicios=svc-1,svc-2');
  });

  it('volver a tocar un servicio lo quita, y el último saca el parámetro', async () => {
    renderSidebar('/tienda?servicios=svc-1');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Esmaltado' }));

    expect(query()).not.toContain('servicios');
  });

  it('elegir una banda de precio la deja en la query', async () => {
    renderSidebar();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('radio', { name: /Hasta L. 300/ }));

    expect(decodeURIComponent(query() ?? '')).toContain('price=0-300');
  });

  it('"Cualquier precio" borra el filtro en vez de mandar "any" al backend', async () => {
    renderSidebar('/tienda?price=0-300');
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('radio', { name: /Cualquier precio/ }),
    );

    expect(query()).not.toContain('price');
  });
});
