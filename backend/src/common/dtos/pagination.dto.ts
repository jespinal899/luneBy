import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

/**
 * Parámetros de paginación y filtrado que comparten los listados.
 * El catálogo de servicios (FilterSidebar del frontend) envía `categorias`
 * como CSV y `price` como banda ("0-50", "50-100"...).
 */
export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;

  /** Categorías separadas por coma. Ej: "manicura,pedicura" */
  @IsOptional()
  @IsString()
  categorias?: string;

  /** Banda de precio: "any" | "0-50" | "50-100" | "100-200" | "200+" */
  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;
}
