import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AvailabilityRule, TimeOff } from './entities';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment, AvailabilityRule, TimeOff]),
    ServicesModule,
    AuthModule,
  ],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
