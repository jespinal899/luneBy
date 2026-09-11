import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  APPOINTMENT_CREATED_EVENT,
  AppointmentCreatedEvent,
} from '../../appointments/events/appointment-created.event';
import { MailService } from '../mail.service';

/**
 * Reacciona a que se creó una cita enviando el correo a la administradora.
 * Vive fuera de `AppointmentsService` a propósito: agendar una cita no debe
 * saber que existe el correo, y agregar otro canal (SMS, push) más adelante
 * no debería tocar la lógica de negocio de citas (OCP).
 */
@Injectable()
export class AppointmentCreatedListener {
  private readonly logger = new Logger('AppointmentCreatedListener');

  constructor(private readonly mailService: MailService) {}

  @OnEvent(APPOINTMENT_CREATED_EVENT)
  async handle(event: AppointmentCreatedEvent) {
    try {
      await this.mailService.sendNewAppointmentNotification(
        event.appointment,
      );
    } catch (error) {
      // Un fallo aquí nunca debe afectar la reserva: ya se guardó antes de
      // emitir el evento. Solo se registra para revisarlo.
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`No se pudo notificar la nueva cita: ${detail}`);
    }
  }
}
