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

  /** Nulo para cuentas que solo inician sesión con Google. */
  @Column('text', { select: false, nullable: true })
  password: string | null;

  @Column('text')
  fullName: string;

  @Column('text', { nullable: true })
  phone: string;

  /** `sub` del ID token de Google. Presente si la cuenta usa Google. */
  @Column('text', { nullable: true, unique: true })
  googleId: string | null;

  /** Foto de perfil de Google (opcional). */
  @Column('text', { nullable: true })
  avatarUrl: string | null;

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
