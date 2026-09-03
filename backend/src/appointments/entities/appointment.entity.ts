import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Service } from '../../services/entities/service.entity';
import { User } from '../../auth/entities/user.entity';

export enum AppointmentStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  done = 'done',
}

@Entity({ name: 'appointments' })
@Index(['date', 'startTime'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Fecha de la cita (YYYY-MM-DD). */
  @Column('date')
  date: string;

  /** Hora de inicio (HH:mm). */
  @Column('text')
  startTime: string;

  /** Hora de fin, calculada a partir de la duración del servicio (HH:mm). */
  @Column('text')
  endTime: string;

  @Column('text', { default: AppointmentStatus.pending })
  status: AppointmentStatus;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => Service, { eager: true })
  service: Service;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
