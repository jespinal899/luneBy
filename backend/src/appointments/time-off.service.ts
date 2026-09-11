import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, MoreThanOrEqual, Repository } from 'typeorm';

import { CreateTimeOffDto } from './dto';
import { TimeOff } from './entities';

/** Bloqueos de agenda (días u horas cerradas), gestionados por el admin. */
@Injectable()
export class TimeOffService {
  constructor(
    @InjectRepository(TimeOff)
    private readonly timeOffRepository: Repository<TimeOff>,
  ) {}

  listTimeOff(from?: string, to?: string) {
    const where =
      from && to
        ? { date: Between(from, to) }
        : from
          ? { date: MoreThanOrEqual(from) }
          : {};
    return this.timeOffRepository.find({ where, order: { date: 'ASC' } });
  }

  /** Cierra un día completo. Si ya estaba cerrado, devuelve el registro. */
  async addTimeOff(dto: CreateTimeOffDto) {
    const existing = await this.timeOffRepository.findOneBy({
      date: dto.date,
      startTime: IsNull(),
    });
    if (existing) return existing;

    return this.timeOffRepository.save(
      this.timeOffRepository.create({
        date: dto.date,
        reason: dto.reason,
        startTime: null,
        endTime: null,
      }),
    );
  }

  async removeTimeOff(id: string) {
    const result = await this.timeOffRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Bloqueo no encontrado');
  }

  /** Bloqueos de una fecha concreta. Usado al calcular disponibilidad. */
  getTimeOffForDate(date: string) {
    return this.timeOffRepository.find({ where: { date } });
  }
}
