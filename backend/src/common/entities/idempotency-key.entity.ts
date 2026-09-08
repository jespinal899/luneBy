import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Registro de una operación de escritura ejecutada con `Idempotency-Key`.
 * La tabla la crea la migración `supabase/migrations/0005_idempotencia.sql`.
 */
@Entity({ name: 'idempotency_keys' })
export class IdempotencyKey {
  /** El valor de la cabecera `Idempotency-Key` que mandó el cliente. */
  @PrimaryColumn('text')
  key: string;

  @Column('uuid', { name: 'userId', nullable: true })
  userId: string | null;

  @Column('text')
  method: string;

  @Column('text')
  path: string;

  /** Código HTTP de la respuesta original (null mientras se ejecuta). */
  @Column('int', { name: 'statusCode', nullable: true })
  statusCode: number | null;

  /** Cuerpo de la respuesta original (null mientras se ejecuta). */
  @Column('jsonb', { nullable: true })
  response: unknown;

  /** Se rellena cuando la operación terminó con éxito. */
  @Column('timestamptz', { name: 'completedAt', nullable: true })
  completedAt: Date | null;

  @Column('timestamptz', { name: 'createdAt', default: () => 'now()' })
  createdAt: Date;
}
