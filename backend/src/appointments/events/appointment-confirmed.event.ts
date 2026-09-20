import { Appointment } from '../entities';

export const APPOINTMENT_CONFIRMED_EVENT = 'appointment.confirmed';

/**
 * La administradora aceptó una cita que estaba pendiente.
 *
 * Se emite solo en la transición, no cada vez que se guarda una cita ya
 * confirmada: si no, volver a tocar "Confirmar" le mandaría otro correo a la
 * clienta.
 */
export class AppointmentConfirmedEvent {
  constructor(public readonly appointment: Appointment) {}
}
