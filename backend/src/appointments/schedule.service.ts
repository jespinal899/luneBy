import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScheduleDayDto } from './dto';
import { AvailabilityRule } from './entities';
import { toMinutes } from './helpers/time.helper';

/** Horario semanal de atención (7 reglas, una por día de la semana). */
@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepository: Repository<AvailabilityRule>,
  ) {}

  /** Los 7 días de la semana; los que no tienen regla van desactivados. */
  async getSchedule() {
    const rules = await this.ruleRepository.find();
    return Array.from({ length: 7 }, (_, weekday) => {
      const rule = rules.find((r) => r.weekday === weekday);
      return {
        weekday,
        startTime: rule?.startTime ?? '17:30',
        endTime: rule?.endTime ?? '22:00',
        isActive: rule?.isActive ?? false,
      };
    });
  }

  /** Reemplaza el horario semanal completo. */
  async replaceSchedule(days: ScheduleDayDto[]) {
    for (const d of days) {
      if (d.isActive && toMinutes(d.startTime) >= toMinutes(d.endTime)) {
        throw new BadRequestException(
          'La hora de apertura debe ser anterior a la de cierre',
        );
      }
    }

    await this.ruleRepository.deleteAll();

    const rows = days
      .filter((d) => d.isActive)
      .map((d) =>
        this.ruleRepository.create({
          weekday: d.weekday,
          startTime: d.startTime,
          endTime: d.endTime,
          slotIntervalMin: 30,
          isActive: true,
        }),
      );
    if (rows.length) await this.ruleRepository.save(rows);

    return this.getSchedule();
  }

  /** Reglas activas de un día de la semana (0 = domingo). Usado al calcular disponibilidad. */
  getActiveRulesForWeekday(weekday: number) {
    return this.ruleRepository.find({ where: { weekday, isActive: true } });
  }
}
