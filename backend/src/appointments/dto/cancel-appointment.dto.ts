import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelAppointmentDto {
  /**
   * Por qué cancela. Opcional a propósito: obligar a justificarse cuando
   * alguien ya decidió irse produce fricción o texto de relleno, que no
   * informa más que el silencio.
   *
   * El cuerpo entero también puede faltar (un cliente viejo cancela sin
   * mandar nada), así que el endpoint no lo exige.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
