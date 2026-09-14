import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AdminProductPage } from './AdminProductPage';

vi.mock('@/shop/api/catalog.actions', () => ({
  createCatalogItem: vi.fn(),
  updateCatalogItem: vi.fn(),
  deleteCatalogItem: vi.fn(),
  getCatalogForAdmin: vi.fn(),
}));
vi.mock('@/shop/api/services.actions', () => ({
  getServicesForAdmin: vi.fn(),
}));

import { createCatalogItem, getCatalogForAdmin } from '@/shop/api/catalog.actions';
import { getServicesForAdmin } from '@/shop/api/services.actions';

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/products/new']}>
        <Routes>
          <Route path="/products/:id" element={<AdminProductPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminProductPage (nuevo diseño)', () => {
  beforeEach(() => {
    vi.mocked(createCatalogItem).mockReset();
    vi.mocked(createCatalogItem).mockResolvedValue({ id: '1' } as never);
    vi.mocked(getCatalogForAdmin).mockResolvedValue({
      count: 0,
      page: 1,
      pages: 1,
      products: [],
    } as never);
    vi.mocked(getServicesForAdmin).mockResolvedValue({
      count: 1,
      page: 1,
      pages: 1,
      products: [
        {
          id: 'svc-1',
          name: 'Manicura',
          price: 350,
          durationMin: 45,
          category: 'Manos',
          slug: 'manicura',
        },
      ],
    } as never);
  });

  it('crea una entrada de catálogo eligiendo un servicio', async () => {
    const user = userEvent.setup();
    renderPage();

    const select = screen.getByRole('combobox');
    await screen.findByRole('option', { name: /manicura/i });
    await user.selectOptions(select, 'svc-1');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(createCatalogItem).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 'svc-1' }),
    );
  });
});
