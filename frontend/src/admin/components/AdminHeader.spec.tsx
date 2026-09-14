import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AdminHeader } from './AdminHeader';

vi.mock('@/admin/api/appointments.actions', () => ({
  getAppointments: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

import {
  getAppointments,
  updateAppointmentStatus,
} from '@/admin/api/appointments.actions';

const renderHeader = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminHeader />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AdminHeader — notificaciones', () => {
  beforeEach(() => {
    vi.mocked(getAppointments).mockReset();
    vi.mocked(updateAppointmentStatus).mockReset();
  });

  it('sin citas pendientes, no muestra el contador', async () => {
    vi.mocked(getAppointments).mockResolvedValue([]);
    renderHeader();

    const bell = await screen.findByRole('button', {
      name: /citas pendientes de confirmar/i,
    });
    expect(bell.querySelector('span')).toBeNull();
  });

  it('con citas pendientes, muestra el contador y el desplegable', async () => {
    vi.mocked(getAppointments).mockResolvedValue([
      {
        id: '1',
        date: '2026-09-20',
        startTime: '10:00',
        endTime: '10:45',
        status: 'pending',
        notes: null,
        priceAtBooking: 350,
        service: { name: 'Manicura Rusa' } as never,
        user: { fullName: 'Kelin Ramírez' } as never,
        createdAt: '2026-09-14T00:00:00Z',
      },
    ] as never);

    const user = userEvent.setup();
    renderHeader();

    const bell = await screen.findByRole('button', {
      name: /citas pendientes de confirmar/i,
    });
    expect(await screen.findByText('1')).toBeInTheDocument();

    await user.click(bell);

    expect(screen.getByText('Kelin Ramírez')).toBeInTheDocument();
    expect(screen.getByText(/Manicura Rusa/)).toBeInTheDocument();
  });

  it('confirmar una cita llama a la mutación con el id correcto', async () => {
    vi.mocked(getAppointments).mockResolvedValue([
      {
        id: 'abc',
        date: '2026-09-20',
        startTime: '10:00',
        endTime: '10:45',
        status: 'pending',
        notes: null,
        priceAtBooking: 350,
        service: { name: 'Manicura Rusa' } as never,
        user: { fullName: 'Kelin Ramírez' } as never,
        createdAt: '2026-09-14T00:00:00Z',
      },
    ] as never);
    vi.mocked(updateAppointmentStatus).mockResolvedValue({} as never);

    const user = userEvent.setup();
    renderHeader();

    const bell = await screen.findByRole('button', {
      name: /citas pendientes de confirmar/i,
    });
    await user.click(bell);
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(updateAppointmentStatus).toHaveBeenCalledWith('abc', 'confirmed');
  });
});

describe('AdminHeader — configuración', () => {
  beforeEach(() => {
    vi.mocked(getAppointments).mockResolvedValue([]);
  });

  it('el ícono de configuración enlaza al horario', () => {
    renderHeader();

    const link = screen.getByRole('link', {
      name: /configuración de horario/i,
    });
    expect(link).toHaveAttribute('href', '/admin/horario');
  });
});
