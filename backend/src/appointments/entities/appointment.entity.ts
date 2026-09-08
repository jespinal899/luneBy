import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Service } from '../../services/entities/service.entity';
import { User } from '../../auth/entities/user.entity';
import { AppointmentItem } from './appointment-item.entity';

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

  /** Precio total congelado al reservar (base + estilos). */
  @Column('float', { name: 'priceAtBooking', nullable: true })
  priceAtBooking: number;

  /** Duración total en minutos (base + estilos), calculada al reservar. */
  @Column('int', { name: 'durationMin', default: 60 })
  durationMin: number;

  @ManyToOne(() => Service, (service) => service.appointments, { eager: true })
  service: Service;

  /** Líneas de la cotización: el servicio base y cada estilo elegido. */
  @OneToMany(() => AppointmentItem, (item) => item.appointment, {
    eager: true,
    cascade: true,
  })
  items: AppointmentItem[];

  @ManyToOne(() => User, (user) => user.appointments, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
