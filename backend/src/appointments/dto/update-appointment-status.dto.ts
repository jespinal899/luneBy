import { IsEnum } from 'class-validator';

import { AppointmentStatus } from '../entities';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
