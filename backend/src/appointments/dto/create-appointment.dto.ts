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

  /**
   * Diseños elegidos ("Soft Glam"), cuando la reserva salió del catálogo.
   * Opcional y aditivo a propósito: reservar un servicio sin diseño sigue
   * siendo válido, y un cliente que aún no conozca este campo sigue
   * funcionando igual (importa durante el despliegue, porque el frontend y
   * la API no se actualizan en el mismo instante).
   *
   * Cada diseño debe pertenecer a uno de los `serviceIds`.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  catalogItemIds?: string[];

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
