import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
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

  /** Devuelve el usuario sin la contraseña junto a un token fresco. */
  private buildAuthResponse(user: User) {
    const { password, ...safeUser } = user;
    return { user: safeUser, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
