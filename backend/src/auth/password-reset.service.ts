import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { IsNull, LessThan, Not, Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto, ResetPasswordDto, VerifyResetCodeDto } from './dto';
import { PasswordReset } from './entities/password-reset.entity';
import { User } from './entities/user.entity';

/** Cuánto vive un código. Suficiente para ir al correo y volver. */
const CODE_TTL_MINUTES = 15;

/**
 * Intentos fallidos antes de quemar el código. Seis dígitos son un millón de
 * combinaciones: sin tope, un script las recorre en minutos.
 */
const MAX_ATTEMPTS = 5;

/** Vida del comprobante que se emite al acertar el código. */
const RESET_TOKEN_TTL = '10m';

/** Marca el token del paso 3 para que no sirva un JWT de sesión normal. */
const RESET_TOKEN_PURPOSE = 'password-reset';

interface ResetTokenPayload {
  sub: string;
  purpose: string;
  /** Qué código concreto se acertó. */
  rid: string;
}

/**
 * Recuperación de contraseña por código enviado al correo, en tres pasos:
 * pedir el código, acertarlo y elegir la contraseña nueva.
 *
 * Vive aparte de `AuthService` porque no comparte nada con iniciar sesión o
 * registrarse: sus reglas son las de un código de un solo uso.
 */
@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordReset)
    private readonly resetRepository: Repository<PasswordReset>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Paso 1: manda un código al correo, si esa cuenta existe.
   *
   * Responde siempre lo mismo, exista o no el correo. Si respondiera distinto,
   * el formulario se convertiría en una forma de averiguar qué personas
   * tienen cuenta en el salón.
   */
  async requestCode({ email }: ForgotPasswordDto) {
    const user = await this.userRepository.findOneBy({ email });

    if (user?.isActive) {
      if (await this.hasLocalPassword(user.id)) {
        await this.sendFreshCode(user);
      } else {
        // Cuenta creada con Google: no hay contraseña que recuperar. Se le
        // avisa por correo, que es donde sí puede leerlo, en vez de dejarla
        // esperando un código que no va a llegar.
        await this.mailService.sendGoogleAccountNotice(user.email);
      }
    }

    return {
      message:
        'Si ese correo tiene una cuenta, te enviamos un código para recuperarla.',
    };
  }

  /** Paso 2: comprueba el código y entrega el comprobante del paso 3. */
  async verifyCode({ email, code }: VerifyResetCodeDto) {
    const reset = await this.findUsableReset(email);
    // El mismo mensaje para "no hay código", "venció" y "es incorrecto": cuál
    // de los tres fue no le sirve a quien está probando a ciegas.
    if (!reset) throw new BadRequestException(INVALID_CODE);

    if (!(await bcrypt.compare(code, reset.codeHash))) {
      reset.attempts += 1;
      // Agotar los intentos quema el código: hay que pedir uno nuevo, y eso
      // pasa por tener acceso al correo.
      if (reset.attempts >= MAX_ATTEMPTS) reset.usedAt = new Date();
      await this.resetRepository.save(reset);
      throw new BadRequestException(INVALID_CODE);
    }

    reset.verifiedAt = new Date();
    await this.resetRepository.save(reset);

    return {
      resetToken: this.jwtService.sign(
        {
          sub: reset.user.id,
          purpose: RESET_TOKEN_PURPOSE,
          rid: reset.id,
        } satisfies ResetTokenPayload,
        { expiresIn: RESET_TOKEN_TTL },
      ),
    };
  }

  /** Paso 3: guarda la contraseña nueva y quema el código. */
  async resetPassword({ resetToken, newPassword }: ResetPasswordDto) {
    const payload = this.readResetToken(resetToken);

    const reset = await this.resetRepository.findOne({
      where: { id: payload.rid },
      relations: { user: true },
    });
    if (!reset || !this.isUsable(reset) || !reset.verifiedAt)
      throw new BadRequestException(EXPIRED_PROCESS);

    await this.userRepository.update(reset.user.id, {
      password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
    });

    reset.usedAt = new Date();
    await this.resetRepository.save(reset);

    return { message: 'Tu contraseña se cambió. Ya puedes iniciar sesión.' };
  }

  /**
   * Genera un código, invalida los anteriores y lo envía.
   *
   * Invalidar los viejos evita que queden varios códigos vivos a la vez: cada
   * uno sería otra puerta abierta, y quien pide uno nuevo suele hacerlo
   * porque el anterior no le llegó.
   */
  private async sendFreshCode(user: User) {
    await this.resetRepository.update(
      { user: { id: user.id }, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    // `randomInt` y no `Math.random()`: este número es lo único que separa a
    // un desconocido de la cuenta, así que tiene que ser impredecible.
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

    await this.resetRepository.save(
      this.resetRepository.create({
        user,
        codeHash: await bcrypt.hash(code, BCRYPT_ROUNDS),
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
      }),
    );

    await this.mailService.sendPasswordResetCode(
      user.email,
      code,
      CODE_TTL_MINUTES,
    );
  }

  /** El código vigente de esa cuenta, si lo hay. */
  private async findUsableReset(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;

    const reset = await this.resetRepository.findOne({
      where: {
        user: { id: user.id },
        usedAt: IsNull(),
        expiresAt: Not(LessThan(new Date())),
      },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    return reset && this.isUsable(reset) ? reset : null;
  }

  private isUsable(reset: PasswordReset) {
    return (
      !reset.usedAt &&
      reset.attempts < MAX_ATTEMPTS &&
      reset.expiresAt.getTime() > Date.now()
    );
  }

  /**
   * Lee el comprobante del paso 2.
   *
   * Comprueba `purpose` porque si no un JWT de sesión normal —que también
   * está firmado con el mismo secreto— serviría para cambiarle la contraseña
   * a su propio dueño sin pasar por el código.
   */
  private readResetToken(token: string): ResetTokenPayload {
    let payload: ResetTokenPayload;
    try {
      payload = this.jwtService.verify<ResetTokenPayload>(token);
    } catch {
      throw new BadRequestException(EXPIRED_PROCESS);
    }

    if (payload.purpose !== RESET_TOKEN_PURPOSE || !payload.rid)
      throw new BadRequestException(EXPIRED_PROCESS);

    return payload;
  }

  /** Las cuentas de Google no tienen contraseña que recuperar. */
  private async hasLocalPassword(userId: string) {
    return (
      (await this.userRepository.countBy({
        id: userId,
        password: Not(IsNull()),
      })) > 0
    );
  }
}

/** Mismo coste que usa `AuthService` al registrar. */
const BCRYPT_ROUNDS = 10;

const INVALID_CODE = 'El código no es válido o ya venció. Pide uno nuevo.';
const EXPIRED_PROCESS =
  'El proceso de recuperación venció. Vuelve a empezar desde tu correo.';
