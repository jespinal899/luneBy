import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { CreateAppointmentDto } from './dto';
import {
  Appointment,
  AppointmentStatus,
  AvailabilityRule,
  TimeOff,
} from './entities';
import { overlaps, toHHMM, toMinutes } from './helpers/time.helper';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepository: Repository<AvailabilityRule>,
    @InjectRepository(TimeOff)
    private readonly timeOffRepository: Repository<TimeOff>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  /**
   * Horas de inicio libres ("HH:mm") para una fecha y un servicio.
   * Descarta las que se solapan con citas existentes, con bloqueos de agenda
   * y, si la fecha es hoy, con las horas ya pasadas.
   */
  async getAvailability(date: string, serviceId: string): Promise<string[]> {
    const service = await this.serviceRepository.findOneBy({ id: serviceId });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    if (!service.isActive)
      throw new BadRequestException(
        'Ese servicio no está disponible para agendar',
      );

    const duration = service.durationMin;
    const weekday = new Date(`${date}T00:00:00`).getDay();

    const rules = await this.ruleRepository.find({
      where: { weekday, isActive: true },
    });
    if (rules.length === 0) return [];

    const busy: Array<[number, number]> = [];

    const dayAppointments = await this.appointmentRepository.find({
      where: { date, status: Not(AppointmentStatus.cancelled) },
    });
    for (const appt of dayAppointments) {
      busy.push([toMinutes(appt.startTime), toMinutes(appt.endTime)]);
    }

    const timeOffs = await this.timeOffRepository.find({ where: { date } });
    for (const off of timeOffs) {
      if (!off.startTime || !off.endTime) return []; // día completo bloqueado
      busy.push([toMinutes(off.startTime), toMinutes(off.endTime)]);
    }

    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = new Set<string>();
    for (const rule of rules) {
      const open = toMinutes(rule.startTime);
      const close = toMinutes(rule.endTime);
      for (let t = open; t + duration <= close; t += rule.slotIntervalMin) {
        if (isToday && t <= nowMinutes) continue;
        const clashes = busy.some(([bs, be]) =>
          overlaps(t, t + duration, bs, be),
        );
        if (!clashes) slots.add(toHHMM(t));
      }
    }

    return [...slots].sort();
  }

  /** Agenda una cita para el usuario autenticado en un slot libre. */
  async create(dto: CreateAppointmentDto, user: User) {
    const { serviceId, date, startTime, notes } = dto;

    const service = await this.serviceRepository.findOneBy({ id: serviceId });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    const available = await this.getAvailability(date, serviceId);
    if (!available.includes(startTime))
      throw new BadRequestException('Ese horario ya no está disponible');

    const endTime = toHHMM(toMinutes(startTime) + service.durationMin);

    const appointment = this.appointmentRepository.create({
      date,
      startTime,
      endTime,
      notes,
      service,
      user,
      status: AppointmentStatus.pending,
      priceAtBooking: service.price,
    });

    try {
      await this.appointmentRepository.save(appointment);
    } catch (error) {
      // `no_overlap_citas`: otra reserva ocupó el tramo entre la comprobación
      // de disponibilidad y el guardado (condición de carrera).
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === '23P01'
      ) {
        throw new BadRequestException('Ese horario ya no está disponible');
      }
      throw error;
    }

    return appointment;
  }

  /** Citas del usuario autenticado, de la más reciente a la más antigua. */
  findMine(user: User) {
    return this.appointmentRepository.find({
      where: { user: { id: user.id } },
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  /** Cancela una cita, solo si pertenece al usuario que lo pide. */
  async cancelOwn(id: string, user: User) {
    const appointment = await this.findOne(id);
    if (appointment.user.id !== user.id)
      throw new BadRequestException(
        'No puedes cancelar una cita que no es tuya',
      );

    appointment.status = AppointmentStatus.cancelled;
    return this.appointmentRepository.save(appointment);
  }

  // ---- Administración (Kelin) ----

  /** Agenda completa, opcionalmente filtrada por fecha y/o estado. */
  findAll(filters: { date?: string; status?: AppointmentStatus }) {
    return this.appointmentRepository.find({
      where: { date: filters.date, status: filters.status },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }
}
