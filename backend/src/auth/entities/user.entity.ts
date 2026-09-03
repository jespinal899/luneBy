import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  fullName: string;

  @Column('text', { nullable: true })
  phone: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['client'] })
  roles: string[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
