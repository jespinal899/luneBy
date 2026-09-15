import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Un bloque de contenido editable desde el panel, guardado como clave/valor.
 *
 * La portada dejó de estar escrita en el código para que la administradora
 * pueda cambiar el título, el texto y la foto sin depender de un despliegue.
 *
 * El valor es `jsonb` y no una columna por campo a propósito: el día que se
 * quiera editar también "Nosotros" o los datos de contacto, es una fila nueva
 * y no una migración nueva. El precio de esa flexibilidad es que el esquema no
 * valida la forma del valor; de eso se encargan los DTO al escribir.
 */
@Entity({ name: 'site_content' })
export class SiteContent {
  /** Identificador del bloque: `hero`, y en el futuro `nosotros`, `contacto`. */
  @PrimaryColumn('text')
  key: string;

  @Column('jsonb')
  value: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
