import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString, Min } from 'class-validator';

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

  /**
   * Ids de servicios separados por coma. Filtra el catálogo por el servicio
   * al que pertenece cada diseño: lo usa el panel de filtros de /shop y, con
   * un solo id, el paso de elegir diseño al agendar.
   */
  @IsOptional()
  @IsString()
  servicios?: string;

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

  /**
   * Orden del listado: "name" (alfabético, default — para navegar el
   * catálogo completo) o "recent" (más nuevos primero — para vistas previas
   * tipo "lo último que agregamos").
   */
  @IsOptional()
  @IsIn(['name', 'recent'])
  sort?: 'name' | 'recent';
}
