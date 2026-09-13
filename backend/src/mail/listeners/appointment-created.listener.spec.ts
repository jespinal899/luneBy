import { Test } from '@nestjs/testing';

import { AppointmentCreatedListener } from './appointment-created.listener';
import { MailService } from '../mail.service';

describe('AppointmentCreatedListener', () => {
  let listener: AppointmentCreatedListener;

  const mailService = { sendNewAppointmentNotification: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentCreatedListener,
        { provide: MailService, useValue: mailService },
      ],
    }).compile();
    listener = moduleRef.get(AppointmentCreatedListener);
  });

  it('notifica la cita nueva por correo', async () => {
    mailService.sendNewAppointmentNotification.mockResolvedValue(undefined);
    const appointment = { id: '1' };

    await listener.handle({ appointment } as never);

    expect(mailService.sendNewAppointmentNotification).toHaveBeenCalledWith(
      appointment,
    );
  });

  it('si el envío de correo falla, no propaga el error', async () => {
    mailService.sendNewAppointmentNotification.mockRejectedValue(
      new Error('smtp caído'),
    );

    await expect(
      listener.handle({ appointment: { id: '1' } } as never),
    ).resolves.toBeUndefined();
  });
});
