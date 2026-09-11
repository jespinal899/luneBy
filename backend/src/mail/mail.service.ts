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

    const { subject, html } = buildNewAppointmentEmail(
      appointment,
      this.buildAdminPanelUrl(),
    );

    await this.sender.send({ to: adminEmail, subject, html });
  }

  /**
   * Enlace al panel de citas admin. `FRONTEND_URL` puede traer varios
   * orígenes separados por coma (mismo formato que usa el CORS de main.ts) y
   * a veces una barra final — se toma el primero y se arma la ruta con
   * `URL` para no terminar con dobles barras ni la coma incluida.
   */
  private buildAdminPanelUrl(): string {
    const raw =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const base = raw.split(',')[0].trim();
    return new URL('/admin/citas', base).toString();
  }
}
