import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuoteProvider } from './QuoteProvider';
import type { QuoteItem } from './quote-context';
import { useQuote } from './use-quote';

const STORAGE_KEY = 'luneby_quote';

const item = (over: Partial<QuoteItem> = {}): QuoteItem => ({
  serviceId: 'svc-1',
  name: 'Esmaltado',
  slug: 'esmaltado',
  price: 350,
  durationMin: 45,
  ...over,
});

/**
 * Sonda: expone el estado de la cotización y dispara cada acción, que es la
 * única forma de ejercitar el reducer a través de su API pública.
 */
const Probe = () => {
  const q = useQuote();
  return (
    <div>
      <span data-testid="resumen">
        {q.count} · {q.total} · {q.totalDuration} · {String(q.isOpen)}
      </span>
      <span data-testid="lineas">
        {q.items.map((i) => `${i.serviceId}:${i.name}`).join('|')}
      </span>
      <button onClick={() => q.add(item())}>add</button>
      <button onClick={() => q.add(item({ name: 'Duplicado' }))}>
        add-otra-vez
      </button>
      <button onClick={() => q.choose(item({ name: 'Soft Glam', price: 500 }))}>
        choose
      </button>
      <button onClick={() => q.toggle(item())}>toggle</button>
      <button onClick={() => q.remove('svc-1')}>remove</button>
      <button onClick={() => q.clear()}>clear</button>
      <button onClick={() => q.open()}>open</button>
      <button onClick={() => q.close()}>close</button>
      <span data-testid="esta">{String(q.isInQuote('svc-1'))}</span>
    </div>
  );
};

const renderProvider = () =>
  render(
    <QuoteProvider>
      <Probe />
    </QuoteProvider>,
  );

const resumen = () => screen.getByTestId('resumen').textContent;
const lineas = () => screen.getByTestId('lineas').textContent;
const click = (nombre: string) =>
  userEvent.click(screen.getByRole('button', { name: nombre }));

describe('QuoteProvider', () => {
  beforeEach(() => localStorage.clear());

  it('arranca vacía', () => {
    renderProvider();
    expect(resumen()).toBe('0 · 0 · 0 · false');
  });

  it('add suma el servicio, con su precio y duración', async () => {
    renderProvider();
    await click('add');

    expect(resumen()).toBe('1 · 350 · 45 · false');
    expect(screen.getByTestId('esta').textContent).toBe('true');
  });

  it('add dos veces el mismo servicio no duplica la línea', async () => {
    renderProvider();
    await click('add');
    await click('add-otra-vez');

    expect(lineas()).toBe('svc-1:Esmaltado');
  });

  it('choose reemplaza el diseño de un servicio ya cotizado', async () => {
    renderProvider();
    await click('add');
    await click('choose');

    expect(lineas()).toBe('svc-1:Soft Glam');
    expect(resumen()).toContain('500');
  });

  it('toggle agrega si no está y quita si ya está', async () => {
    renderProvider();

    await click('toggle');
    expect(resumen()).toContain('1 ·');

    await click('toggle');
    expect(resumen()).toContain('0 ·');
  });

  it('remove y clear vacían la cotización', async () => {
    renderProvider();
    await click('add');
    await click('remove');
    expect(resumen()).toContain('0 ·');

    await click('add');
    await click('clear');
    expect(resumen()).toContain('0 ·');
  });

  it('open y close manejan el panel', async () => {
    renderProvider();
    await click('open');
    expect(resumen()).toContain('true');

    await click('close');
    expect(resumen()).toContain('false');
  });

  it('persiste en localStorage y rehidrata al volver', async () => {
    const { unmount } = renderProvider();
    await click('add');

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toHaveLength(
      1,
    );

    unmount();
    renderProvider();
    expect(lineas()).toBe('svc-1:Esmaltado');
  });

  it('si lo guardado está corrupto, arranca vacía en vez de romper', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    renderProvider();
    expect(resumen()).toBe('0 · 0 · 0 · false');
  });

  it('si lo guardado no es una lista, lo descarta', () => {
    localStorage.setItem(STORAGE_KEY, '{"serviceId":"svc-1"}');
    renderProvider();
    expect(resumen()).toBe('0 · 0 · 0 · false');
  });

  it('si localStorage no está disponible, la cotización sigue en memoria', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('modo privado');
    });

    renderProvider();
    await click('add');

    expect(resumen()).toContain('1 ·');
    vi.restoreAllMocks();
  });

  it('useQuote fuera del provider avisa en vez de devolver undefined', () => {
    const silencio = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/dentro de <QuoteProvider>/);
    silencio.mockRestore();
  });
});
