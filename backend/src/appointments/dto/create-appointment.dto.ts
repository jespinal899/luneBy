import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AppointmentItemDto {
  /** Servicio de tipo 'estilo'. */
  @IsUUID()
  serviceId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class CreateAppointmentDto {
  /** Servicio base (manicura, acrílico…). */
  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;

  /** Uno de los slots libres devueltos por GET /appointments/availability. */
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener el formato HH:mm',
  })
  startTime: string;

  /** Estilos elegidos para las uñas, cada uno con su cantidad. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AppointmentItemDto)
  items?: AppointmentItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
