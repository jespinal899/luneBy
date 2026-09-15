import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Los textos y la foto de la portada.
 *
 * Los máximos no son burocracia: el título se muestra en una tipografía de
 * 6rem y el subtítulo en una columna angosta, así que un texto muy largo
 * rompe el diseño en el teléfono. Es más amable cortarlo acá, con un mensaje
 * claro, que dejar que se vea mal en el sitio.
 */
export class UpdateHeroDto {
  /** Línea pequeña sobre el título ("Estudio de uñas · Choloma"). */
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Transform(trim)
  eyebrow: string;

  @IsString()
  @MinLength(2)
  @MaxLength(90)
  @Transform(trim)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @Transform(trim)
  subtitle: string;

  /**
   * Foto de la portada. Nula significa "usá la que viene con el sitio": así
   * la administradora puede volver atrás sin que nadie le suba un archivo.
   */
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => (value === '' ? null : value))
  image?: string | null;
}
