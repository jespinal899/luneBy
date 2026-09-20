import { Appointment } from '../../appointments/entities';
import { buildAppointmentConfirmedEmail } from './appointment-confirmed.template';

const cita = (over: Partial<Appointment> = {}) =>
  ({
    id: 'a1',
    date: '2026-09-25', // viernes
    startTime: '10:00',
    endTime: '11:00',
    priceAtBooking: 500,
    user: { fullName: 'Kelin Ramírez', email: 'kelin@example.com' },
    service: { name: 'Esmaltado' },
    items: [{ nameAtBooking: 'Esmaltado · Soft Glam', priceAtBooking: 500 }],
    ...over,
  }) as Appointment;

describe('buildAppointmentConfirmedEmail', () => {
  it('el asunto dice que quedó confirmada, con fecha y hora', () => {
    const { subject } = buildAppointmentConfirmedEmail(cita());

    expect(subject).toContain('confirmada');
    expect(subject).toContain('viernes 25 de septiembre');
    expect(subject).toContain('10:00');
  });

  it('saluda por el primer nombre, no por el nombre completo', () => {
    const { html } = buildAppointmentConfirmedEmail(cita());

    expect(html).toContain('¡Bienvenida, Kelin!');
    expect(html).not.toContain('¡Bienvenida, Kelin Ramírez!');
  });

  it('dice que la esperan, con la fecha acordada', () => {
    const { html } = buildAppointmentConfirmedEmail(cita());

    expect(html).toContain('Te esperamos');
    expect(html).toContain('viernes 25 de septiembre');
    expect(html).toContain('10:00');
  });

  it('lista lo reservado y el total', () => {
    const { html } = buildAppointmentConfirmedEmail(cita());

    expect(html).toContain('Esmaltado · Soft Glam');
    expect(html).toContain('L. 500');
  });

  // Las citas anteriores al catálogo no tienen líneas: el correo no puede
  // salir vacío por eso.
  it('sin líneas cae al nombre del servicio', () => {
    const { html } = buildAppointmentConfirmedEmail(
      cita({ items: [] as never }),
    );

    expect(html).toContain('Esmaltado');
  });

  it('sin precio congelado no inventa un total', () => {
    const { html } = buildAppointmentConfirmedEmail(
      cita({ priceAtBooking: null as never }),
    );

    expect(html).not.toContain('Total:');
  });

  it('explica cómo cancelar si le surge algo', () => {
    const { html } = buildAppointmentConfirmedEmail(cita());

    expect(html).toContain('Mis citas');
  });
});
