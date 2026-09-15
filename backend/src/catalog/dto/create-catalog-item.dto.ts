import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCatalogItemDto {
  /** Nombre del diseño ("Soft Glam"), no el del servicio. */
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  /** Precio propio del diseño, en lempiras. */
  @IsNumber()
  @Min(0)
  price: number;

  /** Servicio agendable al que corresponde el diseño. */
  @IsUUID()
  serviceId: string;

  // Igual que en los servicios: el frontend manda "" para quitar la foto y
  // se normaliza a null antes de validar, para no chocar con @IsUrl().
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === '' ? null : value))
  image?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  /** Visible en el catálogo público. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
