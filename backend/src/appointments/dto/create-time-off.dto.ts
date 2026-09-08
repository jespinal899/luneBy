import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/** Cierra un día completo de la agenda. */
export class CreateTimeOffDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;
}
