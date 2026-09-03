import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import {
  Appointment,
  AvailabilityRule,
  TimeOff,
} from '../appointments/entities';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepository: Repository<AvailabilityRule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(TimeOff)
    private readonly timeOffRepository: Repository<TimeOff>,
  ) {}

  async runSeed() {
    if (this.configService.get('STAGE') === 'prod') {
      throw new ForbiddenException('El seed está deshabilitado en producción');
    }

    await this.wipe();
    await this.insertUsers();
    await this.insertServices();
    await this.insertAvailability();

    return { message: 'SEED EXECUTED' };
  }

  /** Borra en orden inverso a las claves foráneas. */
  private async wipe() {
    await this.appointmentRepository.deleteAll();
    await this.timeOffRepository.deleteAll();
    await this.ruleRepository.deleteAll();
    await this.serviceRepository.deleteAll();
    await this.userRepository.deleteAll();
  }

  private async insertUsers() {
    const users = initialData.users.map((u) => this.userRepository.create(u));
    await this.userRepository.save(users);
  }

  private async insertServices() {
    const services = initialData.services.map((s) =>
      this.serviceRepository.create(s),
    );
    await this.serviceRepository.save(services);
  }

  private async insertAvailability() {
    const rules = initialData.availabilityRules.map((r) =>
      this.ruleRepository.create(r),
    );
    await this.ruleRepository.save(rules);
  }
}
