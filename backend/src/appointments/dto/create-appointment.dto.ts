import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;

  /** Uno de los slots libres devueltos por GET /appointments/availability. */
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener el formato HH:mm',
  })
  startTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
