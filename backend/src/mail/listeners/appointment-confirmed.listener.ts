import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  APPOINTMENT_CONFIRMED_EVENT,
  AppointmentConfirmedEvent,
} from '../../appointments/events/appointment-confirmed.event';
import { MailService } from '../mail.service';

/**
 * Reacciona a que la administradora aceptó una cita, avisándole a la
 * clienta.
 *
 * Vive fuera de `AppointmentsAdminService` a propósito, igual que el aviso
 * de cita nueva: cambiar el estado de una cita no debe saber que existe el
 * correo, y sumar otro canal (SMS, push) no debería tocar el panel (OCP).
 */
@Injectable()
export class AppointmentConfirmedListener {
  private readonly logger = new Logger('AppointmentConfirmedListener');

  constructor(private readonly mailService: MailService) {}

  @OnEvent(APPOINTMENT_CONFIRMED_EVENT)
  async handle(event: AppointmentConfirmedEvent) {
    try {
      await this.mailService.sendAppointmentConfirmed(event.appointment);
    } catch (error) {
      // Un fallo acá nunca debe deshacer la confirmación: ya quedó guardada
      // antes de emitir el evento. Solo se registra para revisarlo.
      const detail =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`No se pudo avisar la cita confirmada: ${detail}`);
    }
  }
}
