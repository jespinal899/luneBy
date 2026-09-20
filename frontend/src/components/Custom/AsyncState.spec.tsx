import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AsyncState } from './AsyncState';

const base = {
    isLoading: false,
    isError: false,
    loadingText: 'Cargando…',
    errorText: 'No se pudo cargar.',
    children: <p>Contenido</p>,
};

const renderState = (over: Partial<typeof base> & { isEmpty?: boolean; emptyState?: React.ReactNode } = {}) =>
    render(<AsyncState {...base} {...over} />);

describe('AsyncState', () => {
    it('con datos muestra el contenido', () => {
        renderState();
        expect(screen.getByText('Contenido')).toBeInTheDocument();
    });

    it('mientras carga no muestra el contenido', () => {
        renderState({ isLoading: true });

        expect(screen.getByText('Cargando…')).toBeInTheDocument();
        expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    // Mientras carga todavía no se sabe si está vacío: el orden importa, y
    // antes dependía de cómo estuvieran anidados los ternarios.
    it('cargando gana sobre vacío', () => {
        renderState({
            isLoading: true,
            isEmpty: true,
            emptyState: <p>Sin nada</p>,
        });

        expect(screen.getByText('Cargando…')).toBeInTheDocument();
        expect(screen.queryByText('Sin nada')).not.toBeInTheDocument();
    });

    it('un error no se muestra como "no hay nada"', () => {
        renderState({
            isError: true,
            isEmpty: true,
            emptyState: <p>Sin nada</p>,
        });

        expect(screen.getByText('No se pudo cargar.')).toBeInTheDocument();
        expect(screen.queryByText('Sin nada')).not.toBeInTheDocument();
    });

    it('vacío muestra su propio mensaje en lugar del contenido', () => {
        renderState({ isEmpty: true, emptyState: <p>Sin nada</p> });

        expect(screen.getByText('Sin nada')).toBeInTheDocument();
        expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    // ShopPage no pasa `emptyState`: una grilla vacía ya se explica sola.
    it('sin emptyState el estado vacío se saltea y cae en el contenido', () => {
        renderState({ isEmpty: true });
        expect(screen.getByText('Contenido')).toBeInTheDocument();
    });
});
