import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
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
  providers: [AppointmentsService, ScheduleService, TimeOffService],
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentItem,
      AvailabilityRule,
      TimeOff,
    ]),
    ServicesModule,
    AuthModule,
  ],
  exports: [
    AppointmentsService,
    ScheduleService,
    TimeOffService,
    TypeOrmModule,
  ],
})
export class AppointmentsModule {}
