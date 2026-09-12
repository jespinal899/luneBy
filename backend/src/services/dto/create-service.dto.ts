import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @MinLength(1)
  category: string;

  @IsInt()
  @IsPositive()
  durationMin: number;

  // El admin puede quitar la imagen (el frontend manda "" para limpiarla);
  // se normaliza a null antes de validar para no chocar con @IsUrl().
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === '' ? null : value))
  image?: string | null;

  @IsOptional()
  @IsString()
  slug?: string;

  /** Disponible para agendar en /shop/agendar. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
