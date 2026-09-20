import { Logger } from '@nestjs/common';

import { Appointment } from '../../appointments/entities';
import { AppointmentConfirmedEvent } from '../../appointments/events/appointment-confirmed.event';
import { MailService } from '../mail.service';
import { AppointmentConfirmedListener } from './appointment-confirmed.listener';

describe('AppointmentConfirmedListener', () => {
  const mailService = { sendAppointmentConfirmed: jest.fn() };
  const listener = new AppointmentConfirmedListener(
    mailService as unknown as MailService,
  );

  const appointment = { id: 'a1' } as Appointment;

  beforeEach(() => jest.clearAllMocks());

  it('avisa a la clienta cuando su cita se confirma', async () => {
    mailService.sendAppointmentConfirmed.mockResolvedValue(undefined);

    await listener.handle(new AppointmentConfirmedEvent(appointment));

    expect(mailService.sendAppointmentConfirmed).toHaveBeenCalledWith(
      appointment,
    );
  });

  // La confirmación ya quedó guardada antes de emitir el evento: que el
  // correo falle no puede deshacerla ni reventar la respuesta del panel.
  it('un fallo del correo se registra y no se propaga', async () => {
    const error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    mailService.sendAppointmentConfirmed.mockRejectedValue(
      new Error('smtp caído'),
    );

    await expect(
      listener.handle(new AppointmentConfirmedEvent(appointment)),
    ).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith(expect.stringContaining('smtp caído'));
    error.mockRestore();
  });
});
