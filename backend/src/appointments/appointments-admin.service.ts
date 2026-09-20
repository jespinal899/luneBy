import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment, AppointmentStatus } from './entities';
import {
  APPOINTMENT_CONFIRMED_EVENT,
  AppointmentConfirmedEvent,
} from './events/appointment-confirmed.event';

/**
 * La agenda vista desde el panel de Kelin: ver todas las citas y cambiarles
 * el estado.
 *
 * Vive aparte de `AppointmentsService` porque son dos audiencias con reglas
 * distintas. La clienta solo alcanza sus propias citas y solo puede
 * cancelarlas; la administradora ve la agenda completa y puede llevar una
 * cita a cualquier estado. Mezclarlas significaba que una clase cambiara por
 * dos motivos: un cambio en las reglas de reserva y un cambio en las
 * herramientas del panel.
 */
@Injectable()
export class AppointmentsAdminService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Agenda completa, opcionalmente filtrada por fecha y/o estado. */
  findAll(filters: { date?: string; status?: AppointmentStatus }) {
    return this.appointmentRepository.find({
      where: { date: filters.date, status: filters.status },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  /**
   * Confirma, cancela o marca como realizada una cita cualquiera.
   *
   * Confirmar avisa a la clienta por correo, pero solo en la transición: el
   * evento no se emite si la cita ya estaba confirmada, para que volver a
   * tocar el botón no le mande el mismo correo otra vez.
   *
   * El aviso sale por evento, no llamando al correo desde acá: cambiar el
   * estado de una cita no tiene por qué saber que existe el correo, y sumar
   * otro canal más adelante no debería tocar esta clase.
   */
  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) throw new NotFoundException('Cita no encontrada');

    const wasConfirmed = appointment.status === AppointmentStatus.confirmed;
    appointment.status = status;
    const saved = await this.appointmentRepository.save(appointment);

    if (status === AppointmentStatus.confirmed && !wasConfirmed) {
      this.eventEmitter.emit(
        APPOINTMENT_CONFIRMED_EVENT,
        new AppointmentConfirmedEvent(saved),
      );
    }

    return saved;
  }
}
