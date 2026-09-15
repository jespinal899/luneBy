import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Service } from '@/api/types';
import { QuoteProvider } from '@/quote/QuoteProvider';
import { toQuoteItem } from '@/quote/quote-context';
import { useQuote } from '@/quote/use-quote';

vi.mock('@/shop/api/catalog.actions', () => ({
  getCatalog: vi.fn(),
}));

import { getCatalog } from '@/shop/api/catalog.actions';

import { DesignPicker } from './DesignPicker';

const esmaltado = {
  id: 'svc-1',
  name: 'Esmaltado',
  slug: 'esmaltado',
  price: 350,
  durationMin: 45,
  category: 'Manos',
  isActive: true,
} as Service;

const design = (over: Record<string, unknown>) => ({
  serviceId: 'svc-1',
  slug: 'esmaltado',
  durationMin: 45,
  category: 'Manos',
  image: null,
  description: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  serviceName: 'Esmaltado',
  ...over,
});

const page = (products: unknown[]) => ({
  products,
  count: products.length,
  page: 1,
  pages: 1,
});

/** Deja ver qué quedó cotizado, que es lo que termina viajando al backend. */
const QuoteProbe = () => {
  const { items } = useQuote();
  return (
    <ul data-testid="cotizacion">
      {items.map((i) => (
        <li key={i.serviceId}>
          {i.name} · {i.price} · {i.catalogItemId ?? 'sin-diseño'} ·{' '}
          {i.durationMin}
        </li>
      ))}
    </ul>
  );
};

const renderPicker = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QuoteProvider>
        <Seed />
        <DesignPicker service={esmaltado} />
        <QuoteProbe />
      </QuoteProvider>
    </QueryClientProvider>,
  );
};

/** El servicio ya está en la cotización: el selector solo aparece después. */
const Seed = () => {
  const { add, isInQuote } = useQuote();
  if (!isInQuote(esmaltado.id)) add(toQuoteItem(esmaltado));
  return null;
};

describe('DesignPicker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getCatalog).mockReset();
  });

  it('muestra cada diseño con su propio precio', async () => {
    vi.mocked(getCatalog).mockResolvedValue(
      page([
        design({ id: 'd-1', name: 'Soft Glam', price: 450 }),
        design({ id: 'd-2', name: 'French', price: 400 }),
      ]) as never,
    );

    renderPicker();

    expect(await screen.findByText('Soft Glam')).toBeInTheDocument();
    expect(screen.getByText('L. 450')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('L. 400')).toBeInTheDocument();
  });

  it('pide solo los diseños del servicio elegido', async () => {
    vi.mocked(getCatalog).mockResolvedValue(page([]) as never);

    renderPicker();

    expect(getCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 'svc-1' }),
    );
  });

  it('al elegir un diseño, se cotiza su nombre y su precio', async () => {
    vi.mocked(getCatalog).mockResolvedValue(
      page([design({ id: 'd-1', name: 'Soft Glam', price: 450 })]) as never,
    );
    const user = userEvent.setup();

    renderPicker();
    await user.click(await screen.findByText('Soft Glam'));

    // La duración sigue siendo la del servicio: es la que usa el cálculo de
    // horarios, y el diseño no debe moverla.
    expect(screen.getByTestId('cotizacion')).toHaveTextContent(
      'Soft Glam · 450 · d-1 · 45',
    );
  });

  it('se puede volver atrás y agendar el servicio sin diseño', async () => {
    vi.mocked(getCatalog).mockResolvedValue(
      page([design({ id: 'd-1', name: 'Soft Glam', price: 450 })]) as never,
    );
    const user = userEvent.setup();

    renderPicker();
    await user.click(await screen.findByText('Soft Glam'));
    await user.click(screen.getByText('Sin diseño específico'));

    expect(screen.getByTestId('cotizacion')).toHaveTextContent(
      'Esmaltado · 350 · sin-diseño · 45',
    );
  });

  it('cambiar de diseño reemplaza el anterior, no agrega otra línea', async () => {
    vi.mocked(getCatalog).mockResolvedValue(
      page([
        design({ id: 'd-1', name: 'Soft Glam', price: 450 }),
        design({ id: 'd-2', name: 'French', price: 400 }),
      ]) as never,
    );
    const user = userEvent.setup();

    renderPicker();
    await user.click(await screen.findByText('Soft Glam'));
    await user.click(screen.getByText('French'));

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByTestId('cotizacion')).toHaveTextContent(
      'French · 400 · d-2',
    );
  });

  // Un servicio al que Kelin todavía no le cargó diseños tiene que poder
  // reservarse igual, y sin un paso vacío en el medio.
  it('no muestra nada si el servicio no tiene diseños', async () => {
    vi.mocked(getCatalog).mockResolvedValue(page([]) as never);

    renderPicker();

    expect(
      await screen.findByText(/Esmaltado · 350 · sin-diseño/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Elige el diseño')).not.toBeInTheDocument();
  });
});
