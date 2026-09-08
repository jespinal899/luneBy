import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  UpdateProfileDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// El correo duplicado (`uq_users_email`) lo traduce a 409 el
// `DatabaseExceptionFilter` global.
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

    if (!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales no válidas');

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

    if (!row || !bcrypt.compareSync(dto.currentPassword, row.password)) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    await this.userRepository.update(user.id, {
      password: bcrypt.hashSync(dto.newPassword, 10),
    });

    return { message: 'Contraseña actualizada' };
  }

  /** Devuelve el usuario sin la contraseña junto a un token fresco. */
  private buildAuthResponse(user: User) {
    const { password, ...safeUser } = user;
    return { user: safeUser, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
