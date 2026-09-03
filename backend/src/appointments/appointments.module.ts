import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Appointment, AvailabilityRule, TimeOff } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, AvailabilityRule, TimeOff])],
  exports: [TypeOrmModule],
})
export class AppointmentsModule {}
