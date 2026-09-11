import { ConfigService } from '@nestjs/config';

import { Appointment, AppointmentStatus } from '../appointments/entities';
import { MailSender } from './interfaces/mail-sender.interface';
import { MailService } from './mail.service';

describe('MailService', () => {
  const sender: MailSender = { send: jest.fn() };
  const config = { get: jest.fn() };

  const appointment = {
    id: 'a1',
    date: '2026-09-20',
    startTime: '18:00',
    endTime: '19:00',
    status: AppointmentStatus.pending,
    notes: null,
    priceAtBooking: 450,
    durationMin: 60,
    service: { name: 'Manicura rusa' } as never,
    items: [{ nameAtBooking: 'Manicura rusa', priceAtBooking: 450 }] as never,
    user: {
      fullName: 'Valentina Ríos',
      email: 'valentina@test.com',
      phone: '9999-9999',
    } as never,
    createdAt: new Date(),
  } as Appointment;

  beforeEach(() => jest.clearAllMocks());

  const buildService = () =>
    new MailService(sender, config as unknown as ConfigService);

  it('no envía nada si ADMIN_EMAIL no está configurado', async () => {
    config.get.mockReturnValue(undefined);

    await buildService().sendNewAppointmentNotification(appointment);

    expect(sender.send).not.toHaveBeenCalled();
  });

  it('envía el aviso a ADMIN_EMAIL con el asunto y la cita', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'ADMIN_EMAIL' ? 'kelin@luneby.com' : undefined,
    );

    await buildService().sendNewAppointmentNotification(appointment);

    expect(sender.send).toHaveBeenCalledTimes(1);
    const [message] = (sender.send as jest.Mock).mock.calls[0];
    expect(message.to).toBe('kelin@luneby.com');
    expect(message.subject).toContain('Valentina Ríos');
    expect(message.html).toContain('Manicura rusa');
  });

  it('arma el link del panel aunque FRONTEND_URL traiga varios orígenes o barra final', async () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'ADMIN_EMAIL') return 'kelin@luneby.com';
      if (key === 'FRONTEND_URL')
        return 'https://www.jespinal03.casa/,https://otro.vercel.app';
      return undefined;
    });

    await buildService().sendNewAppointmentNotification(appointment);

    const [message] = (sender.send as jest.Mock).mock.calls[0];
    expect(message.html).toContain(
      'href="https://www.jespinal03.casa/admin/citas"',
    );
    expect(message.html).not.toContain('otro.vercel.app');
  });
});
