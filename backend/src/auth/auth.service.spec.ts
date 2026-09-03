import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const userRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService.sign.mockReturnValue('signed.jwt.token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('hashea la contraseña y devuelve el usuario sin password más un token', async () => {
      userRepository.create.mockImplementation((data) => ({
        id: 'uuid-1',
        ...data,
      }));
      userRepository.save.mockResolvedValue(undefined);

      const res = await service.register({
        email: 'clienta@example.com',
        password: 'Abc123',
        fullName: 'Clienta Ejemplo',
      });

      const persisted = userRepository.create.mock.calls[0][0];
      expect(persisted.password).not.toBe('Abc123');
      expect(bcrypt.compareSync('Abc123', persisted.password)).toBe(true);
      expect(res.user).not.toHaveProperty('password');
      expect(res.token).toBe('signed.jwt.token');
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 'uuid-1' });
    });
  });

  describe('login', () => {
    const dbUser = () => ({
      id: 'uuid-1',
      email: 'clienta@example.com',
      password: bcrypt.hashSync('Abc123', 10),
      fullName: 'Clienta Ejemplo',
      isActive: true,
      roles: ['client'],
    });

    it('devuelve usuario y token con credenciales válidas', async () => {
      userRepository.findOne.mockResolvedValue(dbUser());

      const res = await service.login({
        email: 'clienta@example.com',
        password: 'Abc123',
      });

      expect(res.user).not.toHaveProperty('password');
      expect(res.token).toBe('signed.jwt.token');
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@example.com', password: 'Abc123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña no coincide', async () => {
      userRepository.findOne.mockResolvedValue(dbUser());

      await expect(
        service.login({ email: 'clienta@example.com', password: 'OtraClave9' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
