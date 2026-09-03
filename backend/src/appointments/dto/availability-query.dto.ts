import { IsDateString, IsUUID } from 'class-validator';

export class AvailabilityQueryDto {
  /** Fecha a consultar (YYYY-MM-DD). */
  @IsDateString()
  date: string;

  /** Servicio para el que se calcula la disponibilidad. */
  @IsUUID()
  serviceId: string;
}
