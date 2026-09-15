import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
vi.mock('@/admin/api/files.actions', () => ({
  uploadServiceImage: (...args: unknown[]) => uploadServiceImage(...args),
}));
// El recorte en sí se prueba en ImageCropper.spec; acá solo importa cómo
// reacciona la página a sus dos salidas.
vi.mock('@/admin/components/ImageCropper', () => ({
  ImageCropper: ({
    file,
    onConfirm,
    onCancel,
  }: {
    file: File;
    onConfirm: (f: File) => void;
    onCancel: () => void;
  }) => (
    <div>
      <span>recortando {file.name}</span>
      <button type="button" onClick={() => onConfirm(new File(['c'], 'recortada.webp'))}>
        confirmar recorte
      </button>
      <button type="button" onClick={onCancel}>
        cancelar recorte
      </button>
    </div>
  ),
}));

const uploadServiceImage = vi.fn();

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
    uploadServiceImage.mockReset();
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

  it('crea un diseño con nombre y precio propios, ligado a su servicio', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre del diseño/i), 'Soft Glam');

    const select = screen.getByRole('combobox');
    await screen.findByRole('option', { name: /manicura/i });
    await user.selectOptions(select, 'svc-1');

    const precio = screen.getByLabelText(/precio/i);
    await user.clear(precio);
    await user.type(precio, '450');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(createCatalogItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Soft Glam',
        price: 450,
        serviceId: 'svc-1',
      }),
    );
  });

  it('no deja guardar un diseño sin nombre', async () => {
    const user = userEvent.setup();
    renderPage();

    const select = screen.getByRole('combobox');
    await screen.findByRole('option', { name: /manicura/i });
    await user.selectOptions(select, 'svc-1');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    // El nombre es lo que distingue un diseño de otro del mismo servicio:
    // sin él volveríamos al problema que este cambio vino a resolver.
    expect(createCatalogItem).not.toHaveBeenCalled();
  });

  it('al elegir una foto abre el recorte en vez de subirla directo', async () => {
    const user = userEvent.setup();
    renderPage();

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(['x'], 'uñas.jpg', { type: 'image/jpeg' }));

    expect(await screen.findByText(/recortando uñas.jpg/)).toBeInTheDocument();
    expect(uploadServiceImage).not.toHaveBeenCalled();
  });

  it('sube recién cuando se confirma el recorte', async () => {
    uploadServiceImage.mockResolvedValue('https://cdn/recortada.webp');
    const user = userEvent.setup();
    renderPage();

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(['x'], 'foto.jpg', { type: 'image/jpeg' }));
    await user.click(await screen.findByText('confirmar recorte'));

    await waitFor(() => expect(uploadServiceImage).toHaveBeenCalled());
    expect(uploadServiceImage.mock.calls[0][0].name).toBe('recortada.webp');
  });

  it('cancelar el recorte cierra el modal sin subir nada', async () => {
    const user = userEvent.setup();
    renderPage();

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, new File(['x'], 'foto.jpg', { type: 'image/jpeg' }));
    await user.click(await screen.findByText('cancelar recorte'));

    await waitFor(() =>
      expect(screen.queryByText('confirmar recorte')).not.toBeInTheDocument(),
    );
    expect(uploadServiceImage).not.toHaveBeenCalled();
  });
});
