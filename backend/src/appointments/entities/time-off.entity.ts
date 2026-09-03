import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Bloqueo puntual de agenda (vacaciones, cita personal, día cerrado).
 * Si `startTime` y `endTime` son null, se bloquea el día completo.
 */
@Entity({ name: 'time_off' })
export class TimeOff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date')
  date: string;

  @Column('text', { nullable: true })
  startTime: string | null;

  @Column('text', { nullable: true })
  endTime: string | null;

  @Column('text', { nullable: true })
  reason: string;
}
