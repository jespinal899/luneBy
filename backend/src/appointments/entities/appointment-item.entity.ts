import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CatalogItem } from '../../catalog/entities/catalog-item.entity';
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

  /**
   * Diseño concreto que eligió la clienta, si eligió uno. Es nulo cuando
   * reservó el servicio sin diseño, y en las citas anteriores a que los
   * diseños tuvieran identidad propia.
   *
   * Si el diseño se borra del catálogo esto queda en null, pero la cita
   * conserva `nameAtBooking` y `priceAtBooking`: para eso están.
   */
  @ManyToOne(() => CatalogItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'catalogItemId' })
  catalogItem: CatalogItem | null;

  @Column('text', { name: 'nameAtBooking' })
  nameAtBooking: string;

  @Column('float', { name: 'priceAtBooking', default: 0 })
  priceAtBooking: number;

  @CreateDateColumn()
  createdAt: Date;
}
