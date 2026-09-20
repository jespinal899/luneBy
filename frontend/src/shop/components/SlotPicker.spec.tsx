import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SlotPicker } from './SlotPicker';

const base = {
    needsChoice: false,
    isLoading: false,
    isError: false,
    slots: ['09:00', '10:00'],
    selected: '',
    onSelect: () => {},
};

const renderPicker = (over: Partial<typeof base> = {}) =>
    render(<SlotPicker {...base} {...over} />);

describe('SlotPicker', () => {
    it('sin servicio ni fecha pide elegirlos antes que nada', () => {
        renderPicker({ needsChoice: true, isLoading: true });

        expect(
            screen.getByText(/Elige al menos un servicio y una fecha/),
        ).toBeInTheDocument();
    });

    it('mientras consulta avisa que está buscando', () => {
        renderPicker({ isLoading: true });
        expect(screen.getByText('Buscando horarios…')).toBeInTheDocument();
    });

    // "No se pudieron cargar" y "no hay horarios" no son lo mismo: el primero
    // invita a reintentar, el segundo a cambiar de fecha.
    it('un error no se confunde con un día sin horarios', () => {
        renderPicker({ isError: true, slots: [] });

        expect(
            screen.getByText('No se pudieron cargar los horarios.'),
        ).toBeInTheDocument();
        expect(screen.queryByText(/otra fecha/)).not.toBeInTheDocument();
    });

    it('sin horarios libres sugiere otra fecha', () => {
        renderPicker({ slots: [] });
        expect(screen.getByText(/No hay horarios libres/)).toBeInTheDocument();
    });

    it('lista los horarios y avisa cuál se tocó', async () => {
        const onSelect = vi.fn();
        renderPicker({ onSelect });

        expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: '10:00' }));
        expect(onSelect).toHaveBeenCalledWith('10:00');
    });

    it('marca visualmente el horario elegido', () => {
        renderPicker({ selected: '10:00' });

        expect(screen.getByRole('button', { name: '10:00' }).className).toContain(
            'bg-brand',
        );
        expect(
            screen.getByRole('button', { name: '09:00' }).className,
        ).not.toContain('bg-brand ');
    });

    it('slots sin definir se trata como día sin horarios, no como error', () => {
        renderPicker({ slots: undefined });
        expect(screen.getByText(/No hay horarios libres/)).toBeInTheDocument();
    });
});
