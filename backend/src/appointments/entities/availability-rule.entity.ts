import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Horario de trabajo recurrente de Kelin. Un registro por franja y día de la
 * semana (0 = domingo ... 6 = sábado).
 */
@Entity({ name: 'availability_rules' })
export class AvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 0 = domingo ... 6 = sábado. */
  @Column('int')
  weekday: number;

  /** Apertura (HH:mm). */
  @Column('text')
  startTime: string;

  /** Cierre (HH:mm). */
  @Column('text')
  endTime: string;

  /** Cada cuántos minutos empieza un slot. */
  @Column('int', { default: 30 })
  slotIntervalMin: number;

  @Column('bool', { default: true })
  isActive: boolean;
}
