import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, QueryFailedError, Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { CreateAppointmentDto } from './dto';
import { Appointment, AppointmentItem, AppointmentStatus } from './entities';
import {
  APPOINTMENT_CREATED_EVENT,
  AppointmentCreatedEvent,
} from './events/appointment-created.event';
import { overlaps, toHHMM, toMinutes } from './helpers/time.helper';
import { ScheduleService } from './schedule.service';
import { TimeOffService } from './time-off.service';

/**
 * Reservas: disponibilidad, creación, y gestión propia/administrativa de
 * citas. El horario semanal y los bloqueos de agenda viven en
 * `ScheduleService` y `TimeOffService`; esta clase solo los consulta.
 */
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(AppointmentItem)
    private readonly itemRepository: Repository<AppointmentItem>,
    private readonly scheduleService: ScheduleService,
    private readonly timeOffService: TimeOffService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Horas de inicio libres ("HH:mm") para una fecha y un servicio.
   * Descarta las que se solapan con citas existentes, con bloqueos de agenda
   * y, si la fecha es hoy, con las horas ya pasadas.
   */
  async getAvailability(
    date: string,
    serviceId: string,
    extraMinutes = 0,
  ): Promise<string[]> {
    const service = await this.serviceRepository.findOneBy({ id: serviceId });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    if (!service.isActive)
      throw new BadRequestException(
        'Ese servicio no está disponible para agendar',
      );

    const duration = service.durationMin + Math.max(0, extraMinutes);
    const weekday = new Date(`${date}T00:00:00`).getDay();

    const rules = await this.scheduleService.getActiveRulesForWeekday(weekday);
    if (rules.length === 0) return [];

    const busy: Array<[number, number]> = [];

    const dayAppointments = await this.appointmentRepository.find({
      where: { date, status: Not(AppointmentStatus.cancelled) },
    });
    for (const appt of dayAppointments) {
      busy.push([toMinutes(appt.startTime), toMinutes(appt.endTime)]);
    }

    const timeOffs = await this.timeOffService.getTimeOffForDate(date);
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

  /** Agenda una cita con los servicios elegidos en un slot libre. */
  async create(dto: CreateAppointmentDto, user: User) {
    const { serviceIds, date, startTime, notes } = dto;

    const ids = [...new Set(serviceIds)];
    const found = await this.serviceRepository.findBy({ id: In(ids) });
    if (found.length !== ids.length)
      throw new NotFoundException('Alguno de los servicios no existe');

    // Respeta el orden en que la clienta los eligió.
    const services = ids.map((id) => found.find((s) => s.id === id)!);
    const inactive = services.find((s) => !s.isActive);
    if (inactive)
      throw new BadRequestException(
        `"${inactive.name}" no está disponible para agendar`,
      );

    const [primary] = services;
    const durationMin = services.reduce((sum, s) => sum + s.durationMin, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const extraMinutes = durationMin - primary.durationMin;

    const available = await this.getAvailability(
      date,
      primary.id,
      extraMinutes,
    );
    if (!available.includes(startTime))
      throw new BadRequestException('Ese horario ya no está disponible');

    const endTime = toHHMM(toMinutes(startTime) + durationMin);

    const appointment = this.appointmentRepository.create({
      date,
      startTime,
      endTime,
      notes,
      service: primary,
      user,
      status: AppointmentStatus.pending,
      priceAtBooking: totalPrice,
      durationMin,
      items: services.map((s) =>
        this.itemRepository.create({
          service: s,
          nameAtBooking: s.name,
          priceAtBooking: s.price,
        }),
      ),
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

    this.eventEmitter.emit(
      APPOINTMENT_CREATED_EVENT,
      new AppointmentCreatedEvent(appointment),
    );

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
