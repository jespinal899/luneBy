import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AvailabilityQueryDto {
  /** Fecha a consultar (YYYY-MM-DD). */
  @IsDateString()
  date: string;

  /** Servicio base para el que se calcula la disponibilidad. */
  @IsUUID()
  serviceId: string;

  /** Minutos extra por los estilos elegidos (se suman a la duración base). */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  @Type(() => Number)
  extraMinutes?: number;
}
