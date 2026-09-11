import { Appointment } from '../entities';

export const APPOINTMENT_CREATED_EVENT = 'appointment.created';

export class AppointmentCreatedEvent {
  constructor(public readonly appointment: Appointment) {}
}
