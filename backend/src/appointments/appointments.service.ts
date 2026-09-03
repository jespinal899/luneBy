import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Service } from '../services/entities/service.entity';
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
}
