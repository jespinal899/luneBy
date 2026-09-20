import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cancelMutate = vi.fn();

vi.mock('@/shop/hooks/use-appointments', () => ({
    useMyAppointments: vi.fn(),
    useCancelAppointment: () => ({
        mutate: cancelMutate,
        isPending: false,
    }),
}));

import { useMyAppointments } from '@/shop/hooks/use-appointments';

import { MyAppointmentsPage } from './MyAppointmentsPage';

const cita = (over: Record<string, unknown> = {}) => ({
    id: 'a1',
    date: '2026-09-25',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    notes: null,
    cancellationReason: null,
    priceAtBooking: 500,
    service: { name: 'Esmaltado' },
    items: [{ id: 'i1', nameAtBooking: 'Esmaltado · Soft Glam' }],
    user: { id: 'u1' },
    createdAt: new Date().toISOString(),
    ...over,
});

const renderPage = () =>
    render(
        <MemoryRouter>
            <MyAppointmentsPage />
        </MemoryRouter>,
    );

const abrirDialogo = async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    return user;
};

describe('MyAppointmentsPage · cancelar una cita', () => {
    beforeEach(() => {
        cancelMutate.mockReset();
        vi.mocked(useMyAppointments).mockReturnValue({
            data: [cita()],
            isLoading: false,
            isError: false,
        } as never);
    });

    it('tocar Cancelar no cancela: primero pide confirmación', async () => {
        await abrirDialogo();

        expect(
            screen.getByRole('heading', { name: '¿Cancelar esta cita?' }),
        ).toBeInTheDocument();
        expect(cancelMutate).not.toHaveBeenCalled();
    });

    // Con varias citas en pantalla, una confirmación sin datos es fácil de
    // aceptar sobre la equivocada.
    it('el aviso dice qué cita se va a cancelar y advierte que no se deshace', async () => {
        await abrirDialogo();

        const dialogo = screen.getByRole('dialog');
        expect(
            within(dialogo).getByText(/Esmaltado · Soft Glam/),
        ).toBeInTheDocument();
        expect(within(dialogo).getByText(/2026-09-25/)).toBeInTheDocument();
        expect(
            within(dialogo).getByText(/no se puede deshacer/),
        ).toBeInTheDocument();
    });

    it('manda el motivo escrito', async () => {
        const user = await abrirDialogo();

        await user.type(
            screen.getByLabelText(/Por qué la cancelas/),
            'Me surgió un imprevisto',
        );
        await user.click(
            screen.getByRole('button', { name: /Sí, cancelar cita/ }),
        );

        expect(cancelMutate).toHaveBeenCalledWith(
            { id: 'a1', reason: 'Me surgió un imprevisto' },
            expect.anything(),
        );
    });

    it('el motivo es opcional: sin escribir nada igual cancela', async () => {
        const user = await abrirDialogo();

        await user.click(
            screen.getByRole('button', { name: /Sí, cancelar cita/ }),
        );

        expect(cancelMutate).toHaveBeenCalledWith(
            { id: 'a1', reason: undefined },
            expect.anything(),
        );
    });

    it('un motivo en blanco no viaja como texto vacío', async () => {
        const user = await abrirDialogo();

        await user.type(screen.getByLabelText(/Por qué la cancelas/), '   ');
        await user.click(
            screen.getByRole('button', { name: /Sí, cancelar cita/ }),
        );

        expect(cancelMutate).toHaveBeenCalledWith(
            { id: 'a1', reason: undefined },
            expect.anything(),
        );
    });

    it('"Volver" cierra sin cancelar', async () => {
        const user = await abrirDialogo();

        await user.click(screen.getByRole('button', { name: 'Volver' }));

        expect(cancelMutate).not.toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('una cita ya cancelada no ofrece cancelarse otra vez', () => {
        vi.mocked(useMyAppointments).mockReturnValue({
            data: [cita({ status: 'cancelled' })],
            isLoading: false,
            isError: false,
        } as never);

        renderPage();

        expect(
            screen.queryByRole('button', { name: 'Cancelar' }),
        ).not.toBeInTheDocument();
    });
});
