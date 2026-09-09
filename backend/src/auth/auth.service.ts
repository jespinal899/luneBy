import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { User } from './entities/user.entity';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  UpdateProfileDto,
} from './dto';
import { GOOGLE_OAUTH_CLIENT } from './google-oauth.provider';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// El correo duplicado (`uq_users_email`) lo traduce a 409 el
// `DatabaseExceptionFilter` global.
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(GOOGLE_OAUTH_CLIENT)
    private readonly googleClient: OAuth2Client,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });
    await this.userRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        isActive: true,
        roles: true,
      },
    });

    if (!user) throw new UnauthorizedException('Credenciales no válidas');
    if (!user.password)
      throw new UnauthorizedException('Esta cuenta inicia sesión con Google');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales no válidas');

    return this.buildAuthResponse(user);
  }

  /**
   * Inicia sesión (o crea la cuenta) con el ID token de Google.
   * Si el correo ya existe con contraseña, se enlaza el `googleId` a esa cuenta.
   */
  async loginWithGoogle(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('El token de Google no es válido');
    }

    if (!payload?.email || !payload.email_verified)
      throw new UnauthorizedException(
        'La cuenta de Google no tiene un correo verificado',
      );

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    let user =
      (await this.userRepository.findOne({ where: { googleId } })) ??
      (await this.userRepository.findOne({ where: { email } }));

    if (user) {
      // Enlaza / actualiza los datos de Google en la cuenta existente.
      if (user.googleId !== googleId || !user.avatarUrl) {
        await this.userRepository.update(user.id, {
          googleId,
          avatarUrl: user.avatarUrl ?? payload.picture ?? null,
        });
        user = await this.userRepository.findOneByOrFail({ id: user.id });
      }
    } else {
      user = this.userRepository.create({
        email,
        fullName: payload.name ?? email.split('@')[0],
        googleId,
        avatarUrl: payload.picture ?? null,
        password: null,
        roles: ['client'],
        isActive: true,
      });
      await this.userRepository.save(user);
    }

    if (!user.isActive)
      throw new UnauthorizedException('Esta cuenta está desactivada');

    return this.buildAuthResponse(user);
  }

  checkAuthStatus(user: User) {
    return this.buildAuthResponse(user);
  }

  /** Actualiza nombre y/o teléfono del usuario autenticado. */
  async updateProfile(user: User, dto: UpdateProfileDto) {
    const changes: { fullName?: string; phone?: string | null } = {};
    if (dto.fullName !== undefined) changes.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) changes.phone = dto.phone.trim() || null;

    if (Object.keys(changes).length > 0) {
      await this.userRepository.update(user.id, changes);
    }

    const updated = await this.userRepository.findOneByOrFail({ id: user.id });
    return this.buildAuthResponse(updated);
  }

  /** Cambia la contraseña verificando primero la actual. */
  async changePassword(user: User, dto: ChangePasswordDto) {
    const row = await this.userRepository.findOne({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!row?.password) {
      throw new UnauthorizedException(
        'Esta cuenta inicia sesión con Google y no tiene contraseña',
      );
    }
    if (!bcrypt.compareSync(dto.currentPassword, row.password)) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    await this.userRepository.update(user.id, {
      password: bcrypt.hashSync(dto.newPassword, 10),
    });

    return { message: 'Contraseña actualizada' };
  }

  /**
   * Devuelve el usuario (sin datos sensibles) y un token fresco.
   * `hasPassword` indica si la cuenta tiene contraseña local (para ocultar el
   * cambio de contraseña en las cuentas que solo usan Google).
   */
  private async buildAuthResponse(user: User) {
    const { password, googleId, ...safeUser } = user;

    const hasPassword =
      password !== undefined
        ? password !== null
        : (await this.userRepository.countBy({
            id: user.id,
            password: Not(IsNull()),
          })) > 0;

    return {
      user: { ...safeUser, hasPassword },
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
