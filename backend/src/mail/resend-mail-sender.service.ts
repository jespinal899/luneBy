import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { MailMessage, MailSender } from './interfaces/mail-sender.interface';

/** Envía correos con Resend (https://resend.com). */
@Injectable()
export class ResendMailSender implements MailSender {
  private readonly logger = new Logger('ResendMailSender');
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      'Luné by Kelin <onboarding@resend.dev>';
  }

  async send(message: MailMessage): Promise<void> {
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
