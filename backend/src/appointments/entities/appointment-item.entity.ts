import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Service } from '../../services/entities/service.entity';
import { Appointment } from './appointment.entity';

/** Línea de cotización congelada de una cita (servicio base o estilo). */
@Entity({ name: 'appointment_items' })
@Index(['appointment'])
export class AppointmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.items, {
    onDelete: 'CASCADE',
  })
  appointment: Appointment;

  @ManyToOne(() => Service, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  service: Service | null;

  @Column('text', { name: 'nameAtBooking' })
  nameAtBooking: string;

  @Column('float', { name: 'priceAtBooking', default: 0 })
  priceAtBooking: number;

  /** 'base' | 'estilo' */
  @Column('text', { default: 'estilo' })
  kind: string;

  @Column('int', { default: 1 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
