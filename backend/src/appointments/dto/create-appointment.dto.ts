import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateAppointmentDto {
  /** Servicios elegidos para la cita (al menos uno, sin repetir). */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  serviceIds: string[];

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
