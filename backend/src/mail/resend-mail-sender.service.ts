import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { MailMessage, MailSender } from './interfaces/mail-sender.interface';

/** Envía correos con Resend (https://resend.com). */
@Injectable()
export class ResendMailSender implements MailSender {
  private readonly logger = new Logger('ResendMailSender');
  // `new Resend(undefined)` lanza en el constructor del SDK: sin key no se
  // crea el cliente (entornos sin correo configurado, como CI, no truenan).
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      'Luné by Kelin <onboarding@resend.dev>';
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY no está configurada: no se envió el correo a ${message.to}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      // No se relanza: un correo que falla no debe tumbar la operación que
      // lo disparó (ej. agendar una cita). Queda registrado para revisar.
      this.logger.error(
        `No se pudo enviar el correo a ${message.to}: ${error.message}`,
      );
    }
  }
}
