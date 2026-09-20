import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuoteProvider } from '@/quote/QuoteProvider';

vi.mock('@/shop/api/services.actions', () => ({ getServices: vi.fn() }));
vi.mock('@/shop/api/catalog.actions', () => ({
    getCatalog: vi.fn(),
    getCatalogItem: vi.fn(),
}));
vi.mock('@/shop/api/appointments.actions', () => ({
    getAvailability: vi.fn(),
    createAppointment: vi.fn(),
    getMyAppointments: vi.fn(),
    cancelAppointment: vi.fn(),
}));
vi.mock('@/auth/context/use-auth', () => ({
    useAuth: () => ({ status: 'authenticated', user: { id: 'u1' } }),
}));

import {
    createAppointment,
    getAvailability,
} from '@/shop/api/appointments.actions';
import { getCatalog } from '@/shop/api/catalog.actions';
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

const Ruta = () => <span data-testid="ruta">{useLocation().pathname}</span>;

const ruta = () => screen.getByTestId('ruta').textContent;

/**
 * Se monta como en producción: un router de datos (`createBrowserRouter` en
 * la app real) y el `QuoteProvider` POR ENCIMA del router, tal como está en
 * luneby.tsx. Con `MemoryRouter` el árbol es distinto y no valdría para
 * cuidar este camino.
 */
const renderAgendar = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const router = createMemoryRouter(
        [
            {
                path: '/shop/agendar',
                element: (
                    <>
                        <AgendarPage />
                        <Ruta />
                    </>
                ),
            },
            {
                path: '/mis-citas',
                element: (
                    <>
                        <p>Mis citas</p>
                        <Ruta />
                    </>
                ),
            },
        ],
        { initialEntries: ['/shop/agendar'] },
    );

    return render(
        <QueryClientProvider client={queryClient}>
            <QuoteProvider>
                <RouterProvider router={router} />
            </QuoteProvider>
        </QueryClientProvider>,
    );
};

/** Recorre el formulario hasta dejarlo listo para confirmar. */
const llenarFormulario = async () => {
    const user = userEvent.setup();
    renderAgendar();

    await user.click(await screen.findByText('Esmaltado'));
    await user.type(screen.getByLabelText('Fecha'), '2026-12-25');
    await user.click(await screen.findByRole('button', { name: '10:00' }));

    return user;
};

const confirmar = (user: Awaited<ReturnType<typeof llenarFormulario>>) =>
    user.click(
        screen.getByRole('button', { name: /Agendar con esta cotización/ }),
    );

describe('AgendarPage · confirmar la reserva', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(getServices).mockResolvedValue({
            products: [esmaltado],
            count: 1,
            page: 1,
            pages: 1,
        } as never);
        vi.mocked(getCatalog).mockResolvedValue({
            products: [],
            count: 0,
            page: 1,
            pages: 1,
        } as never);
        vi.mocked(getAvailability).mockResolvedValue(['10:00'] as never);
        vi.mocked(createAppointment).mockResolvedValue({ id: 'a1' } as never);
    });

    it('agendar lleva a "Mis citas"', async () => {
        const user = await llenarFormulario();

        await confirmar(user);

        expect(ruta()).toBe('/mis-citas');
        expect(screen.getByText('Mis citas')).toBeInTheDocument();
    });

    it('manda lo cotizado, con la fecha y el horario elegidos', async () => {
        const user = await llenarFormulario();

        await confirmar(user);

        expect(createAppointment).toHaveBeenCalledWith({
            serviceIds: ['svc-1'],
            catalogItemIds: [],
            date: '2026-12-25',
            startTime: '10:00',
            notes: undefined,
        });
    });

    it('la cotización queda vacía después de reservar', async () => {
        const user = await llenarFormulario();

        await confirmar(user);

        expect(JSON.parse(localStorage.getItem('luneby_quote') ?? '[]')).toEqual(
            [],
        );
    });

    // Si la reserva falla no se navega: la clienta tiene que ver el error y
    // poder reintentar sin haber perdido lo que eligió.
    it('si falla, se queda en el formulario con la cotización intacta', async () => {
        vi.mocked(createAppointment).mockRejectedValue(new Error('500'));
        const user = await llenarFormulario();

        await confirmar(user);

        expect(ruta()).toBe('/shop/agendar');
        expect(
            await screen.findByText(/No se pudo agendar la cita/),
        ).toBeInTheDocument();
        expect(
            JSON.parse(localStorage.getItem('luneby_quote') ?? '[]'),
        ).toHaveLength(1);
    });
});
