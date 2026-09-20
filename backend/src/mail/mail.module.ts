import { Module } from '@nestjs/common';

import { AppointmentConfirmedListener } from './listeners/appointment-confirmed.listener';
import { AppointmentCreatedListener } from './listeners/appointment-created.listener';
import { MAIL_SENDER } from './interfaces/mail-sender.interface';
import { MailService } from './mail.service';
import { ResendMailSender } from './resend-mail-sender.service';

@Module({
  providers: [
    { provide: MAIL_SENDER, useClass: ResendMailSender },
    MailService,
    AppointmentCreatedListener,
    AppointmentConfirmedListener,
  ],
  exports: [MailService],
})
export class MailModule {}
