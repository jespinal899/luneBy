import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CatalogItem } from '../catalog/entities/catalog-item.entity';
import { ServicesModule } from '../services/services.module';
import { AppointmentsAdminService } from './appointments-admin.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import {
  Appointment,
  AppointmentItem,
  AvailabilityRule,
  TimeOff,
} from './entities';
import { ScheduleService } from './schedule.service';
import { TimeOffService } from './time-off.service';

@Module({
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentsAdminService,
    ScheduleService,
    TimeOffService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentItem,
      AvailabilityRule,
      TimeOff,
      // Solo para leer el diseño elegido al agendar; su CRUD vive en
      // CatalogModule.
      CatalogItem,
    ]),
    ServicesModule,
    AuthModule,
  ],
  exports: [
    AppointmentsService,
    AppointmentsAdminService,
    ScheduleService,
    TimeOffService,
    TypeOrmModule,
  ],
})
export class AppointmentsModule {}
