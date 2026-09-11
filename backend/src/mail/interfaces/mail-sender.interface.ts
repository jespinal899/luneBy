export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * Abstracción del transporte de correo. `MailService` depende de esta
 * interfaz, no de un proveedor concreto (DIP) — cambiar de Resend a otro
 * proveedor solo implica una nueva clase que la implemente, sin tocar a
 * quien la usa (OCP).
 */
export interface MailSender {
  send(message: MailMessage): Promise<void>;
}

/** Token de inyección para `MailSender` (es una interfaz, no existe en runtime). */
export const MAIL_SENDER = Symbol('MAIL_SENDER');
