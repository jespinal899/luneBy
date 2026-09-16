import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

/**
 * Un código de recuperación de contraseña pedido por alguien que olvidó la
 * suya.
 *
 * El código no se guarda en claro: `codeHash` es su hash con bcrypt. Un
 * código vale tanto como la cuenta —deja entrar sin saber la contraseña—,
 * así que se trata con el mismo cuidado.
 */
@Entity({ name: 'password_resets' })
@Index(['user'])
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text', { name: 'codeHash' })
  codeHash: string;

  @Column('timestamptz', { name: 'expiresAt' })
  expiresAt: Date;

  /**
   * Intentos fallidos. Seis dígitos son un millón de combinaciones: sin un
   * tope, un script las prueba en minutos.
   */
  @Column('int', { default: 0 })
  attempts: number;

  /** Cuándo se acertó el código. Hasta entonces no se puede cambiar nada. */
  @Column('timestamptz', { name: 'verifiedAt', nullable: true })
  verifiedAt: Date | null;

  /** Cuándo se usó para cambiar la contraseña. Un código sirve una sola vez. */
  @Column('timestamptz', { name: 'usedAt', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
