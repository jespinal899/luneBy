import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment, AppointmentStatus } from './entities';

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
  ) {}

  /** Agenda completa, opcionalmente filtrada por fecha y/o estado. */
  findAll(filters: { date?: string; status?: AppointmentStatus }) {
    return this.appointmentRepository.find({
      where: { date: filters.date, status: filters.status },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  /** Confirma, cancela o marca como realizada una cita cualquiera. */
  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) throw new NotFoundException('Cita no encontrada');

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }
}
