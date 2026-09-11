import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Appointment } from '../appointments/entities';
import { MAIL_SENDER, MailSender } from './interfaces/mail-sender.interface';
import { buildNewAppointmentEmail } from './templates/new-appointment.template';

/**
 * API de correo a nivel de negocio: sabe QUÉ enviar (usa las plantillas),
 * pero no CÓMO se envía (delega en `MailSender`, inyectado por interfaz).
 */
@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_SENDER) private readonly sender: MailSender,
    private readonly config: ConfigService,
  ) {}

  /** Avisa a la administradora que hay una cita nueva por confirmar. */
  async sendNewAppointmentNotification(appointment: Appointment) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (!adminEmail) return; // sin configurar: no hay a quién avisar

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const { subject, html } = buildNewAppointmentEmail(
      appointment,
      `${frontendUrl}/admin/citas`,
    );

    await this.sender.send({ to: adminEmail, subject, html });
  }
}
