import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { CustomPagination } from './CustomPagination';

const renderPagination = (totalPages: number, initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CustomPagination totalPages={totalPages} />
    </MemoryRouter>,
  );

describe('CustomPagination', () => {
  it('sin ?page en la URL, arranca en la página 1', () => {
    renderPagination(3);

    expect(screen.getByRole('button', { name: /anteriores/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: '1' })).toBeEnabled();
  });

  it('con un ?page inválido (no numérico), vuelve a la página 1', () => {
    renderPagination(3, '/?page=abc');

    expect(screen.getByRole('button', { name: /anteriores/i })).toBeDisabled();
  });

  it('deshabilita "Siguientes" en la última página', () => {
    renderPagination(2, '/?page=2');

    expect(screen.getByRole('button', { name: /siguientes/i })).toBeDisabled();
  });

  it('avanza de página al hacer click en un número', async () => {
    const user = userEvent.setup();
    renderPagination(3);

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByRole('button', { name: /anteriores/i })).toBeEnabled();
  });
});
