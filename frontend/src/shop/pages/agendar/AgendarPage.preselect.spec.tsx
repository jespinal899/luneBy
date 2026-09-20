import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuoteProvider } from '@/quote/QuoteProvider';
import { useQuote } from '@/quote/use-quote';

vi.mock('@/shop/api/services.actions', () => ({ getServices: vi.fn() }));
vi.mock('@/shop/api/catalog.actions', () => ({
    getCatalog: vi.fn(),
    getCatalogItem: vi.fn(),
}));
vi.mock('@/shop/api/appointments.actions', () => ({
    getAvailability: vi.fn(),
    createAppointment: vi.fn(),
}));
vi.mock('@/auth/context/use-auth', () => ({
    useAuth: () => ({ status: 'unauthenticated', user: null }),
}));

import { getCatalog, getCatalogItem } from '@/shop/api/catalog.actions';
import { getServices } from '@/shop/api/services.actions';

import { AgendarPage } from './AgendarPage';

const esmaltado = {
    id: 'svc-1',
    name: 'Esmaltado',
    slug: 'esmaltado',
    price: 350,
    durationMin: 45,
    isActive: true,
};

/** Soft Glam: un diseño de Esmaltado que cuesta L. 150 por encima. */
const softGlam = {
    id: 'dis-1',
    serviceId: 'svc-1',
    serviceName: 'Esmaltado',
    servicePrice: 350,
    name: 'Soft Glam',
    slug: 'soft-glam',
    price: 150,
    durationMin: 45,
    image: null,
    description: null,
    isActive: true,
    createdAt: new Date().toISOString(),
};

/** Deja ver qué quedó cotizado, que es lo que se manda al agendar. */
const QuoteProbe = () => {
    const { items } = useQuote();
    return (
        <ul data-testid="cotizacion">
            {items.map((i) => (
                <li key={i.serviceId}>
                    {i.name} · {i.price} · {i.catalogItemId ?? 'sin-diseño'}
                </li>
            ))}
        </ul>
    );
};

const renderAgendar = (url: string) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[url]}>
                <QuoteProvider>
                    <AgendarPage />
                    <QuoteProbe />
                </QuoteProvider>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe('AgendarPage · precarga desde el catálogo', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(getServices).mockResolvedValue({
            products: [esmaltado],
            count: 1,
            page: 1,
            pages: 1,
        } as never);
        vi.mocked(getCatalog).mockResolvedValue({
            products: [softGlam],
            count: 1,
            page: 1,
            pages: 1,
        } as never);
        vi.mocked(getCatalogItem).mockResolvedValue(softGlam as never);
    });

    // El fallo: desde el detalle de un diseño se llegaba con el servicio a
    // secas, así que la clienta que eligió un Soft Glam veía "Esmaltado" a
    // L. 350 y tenía que volver a elegir el diseño a mano.
    it('llegar con ?diseno= deja cotizado el diseño, no solo su servicio', async () => {
        renderAgendar('/shop/agendar?serviceId=svc-1&diseno=dis-1');

        expect(
            await screen.findByText(/Esmaltado · Soft Glam · 500 · dis-1/),
        ).toBeInTheDocument();
    });

    it('el precio es el del servicio más el adicional del diseño', async () => {
        renderAgendar('/shop/agendar?serviceId=svc-1&diseno=dis-1');

        // Acotado a la cotización: "Soft Glam" también aparece en el selector
        // de diseños de más abajo.
        const cotizacion = await screen.findByTestId('cotizacion');
        const linea = await within(cotizacion).findByText(/Soft Glam/);

        expect(linea.textContent).toContain('500');
        expect(linea.textContent).not.toContain('· 350 ·');
    });

    it('sin ?diseno= sigue precargando el servicio solo', async () => {
        renderAgendar('/shop/agendar?serviceId=svc-1');

        expect(
            await screen.findByText(/Esmaltado · 350 · sin-diseño/),
        ).toBeInTheDocument();
        expect(getCatalogItem).not.toHaveBeenCalled();
    });

    it('sin parámetros no cotiza nada por su cuenta', async () => {
        renderAgendar('/shop/agendar');

        await screen.findByRole('heading', { name: 'Agendar cita' });
        expect(screen.getByTestId('cotizacion')).toBeEmptyDOMElement();
    });

    it('un diseño que ya no existe no rompe la pantalla', async () => {
        vi.mocked(getCatalogItem).mockRejectedValue(new Error('404'));

        renderAgendar('/shop/agendar?serviceId=svc-1&diseno=borrado');

        // El servicio igual queda cotizado: se pierde el diseño, no la reserva.
        expect(
            await screen.findByText(/Esmaltado · 350 · sin-diseño/),
        ).toBeInTheDocument();
    });
});
