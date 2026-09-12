import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class CreateCatalogItemDto {
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
