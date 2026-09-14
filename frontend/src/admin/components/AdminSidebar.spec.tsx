import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AdminSidebar } from './AdminSidebar';

const logout = vi.fn();

vi.mock('@/auth/context/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      fullName: 'Kelin Ramírez',
      email: 'kelin@example.com',
      roles: ['admin'],
    },
    logout,
  }),
}));

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <AdminSidebar isCollapsed={false} onToggle={() => {}} />
    </MemoryRouter>,
  );

describe('AdminSidebar — menú de usuario', () => {
  beforeEach(() => {
    logout.mockReset();
  });

  it('muestra el nombre y correo del usuario', () => {
    renderSidebar();

    expect(screen.getByText('Kelin Ramírez')).toBeInTheDocument();
    expect(screen.getByText('kelin@example.com')).toBeInTheDocument();
  });

  it('al hacer click, abre el menú con las tres opciones', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByText('Kelin Ramírez'));

    expect(screen.getByRole('link', { name: /ver cuenta/i })).toHaveAttribute(
      'href',
      '/perfil',
    );
    expect(
      screen.getByRole('link', { name: /volver al inicio/i }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
  });

  it('cerrar sesión llama a logout()', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByText('Kelin Ramírez'));
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalled();
  });
});
