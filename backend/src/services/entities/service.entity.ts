import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text')
  category: string;

  /** Duración estimada del servicio en minutos. */
  @Column('int', { default: 60 })
  durationMin: number;

  /** URL de la imagen del servicio (opcional). */
  @Column('text', { nullable: true })
  image: string;

  @Column('text', { unique: true })
  slug: string;

  /** Si el servicio se puede agendar. */
  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];

  @BeforeInsert()
  generateSlugOnInsert() {
    if (!this.slug) this.slug = this.name;
    this.slug = this.slugify(this.slug);
  }

  @BeforeUpdate()
  generateSlugOnUpdate() {
    if (this.slug) this.slug = this.slugify(this.slug);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
