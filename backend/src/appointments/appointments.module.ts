import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesModule } from '../services/services.module';
import { AppointmentsService } from './appointments.service';
import { Appointment, AvailabilityRule, TimeOff } from './entities';

@Module({
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment, AvailabilityRule, TimeOff]),
    ServicesModule,
  ],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
