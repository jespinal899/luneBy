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

/** Línea de la cotización congelada de una cita: un servicio elegido. */
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

  @CreateDateColumn()
  createdAt: Date;
}
