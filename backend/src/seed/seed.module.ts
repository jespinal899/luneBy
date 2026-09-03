import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, ServicesModule, AppointmentsModule],
})
export class SeedModule {}
