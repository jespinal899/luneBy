import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AdminServicioPage } from './AdminServicioPage';

vi.mock('@/shop/api/services.actions', () => ({
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
  getService: vi.fn(),
  getServices: vi.fn(),
}));

import { createService } from '@/shop/api/services.actions';

const renderPage = (initialPath: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/agendar/:id" element={<AdminServicioPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminServicioPage (nuevo servicio)', () => {
  beforeEach(() => {
    vi.mocked(createService).mockReset();
    vi.mocked(createService).mockResolvedValue({ id: '1' } as never);
  });

  it('crea un servicio con los valores del formulario', async () => {
    const user = userEvent.setup();
    renderPage('/agendar/new');

    await user.type(
      screen.getByPlaceholderText('Ej: Manicura Rusa Premium'),
      'Manicura Rusa',
    );
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(createService).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Manicura Rusa' }),
    );
  });
});
