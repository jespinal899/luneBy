import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { GOOGLE_OAUTH_CLIENT } from './google-oauth.provider';

describe('AuthService', () => {
  let service: AuthService;

  const userRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findOneByOrFail: jest.fn(),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
  const configService = { get: jest.fn().mockReturnValue('client-id') };
  const googleClient = { verifyIdToken: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService.sign.mockReturnValue('signed.jwt.token');
    configService.get.mockReturnValue('client-id');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: GOOGLE_OAUTH_CLIENT, useValue: googleClient },
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

    it('rechaza el login con contraseña de una cuenta solo-Google', async () => {
      userRepository.findOne.mockResolvedValue({ ...dbUser(), password: null });

      await expect(
        service.login({ email: 'clienta@example.com', password: 'Abc123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('loginWithGoogle', () => {
    const payload = {
      email: 'nueva@gmail.com',
      email_verified: true,
      sub: 'google-123',
      name: 'Nueva Clienta',
      picture: 'https://pic',
    };
    const ticket = { getPayload: () => payload };

    it('crea la cuenta si el correo no existe', async () => {
      googleClient.verifyIdToken.mockResolvedValue(ticket);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((d) => ({ id: 'uuid-9', ...d }));
      userRepository.save.mockResolvedValue(undefined);

      const res = await service.loginWithGoogle('id-token');

      const created = userRepository.create.mock.calls[0][0];
      expect(created.googleId).toBe('google-123');
      expect(created.password).toBeNull();
      expect(created.roles).toEqual(['client']);
      expect(res.user).not.toHaveProperty('password');
      expect(res.user).not.toHaveProperty('googleId');
      expect(res.token).toBe('signed.jwt.token');
    });

    it('enlaza el googleId a una cuenta existente con el mismo correo', async () => {
      googleClient.verifyIdToken.mockResolvedValue(ticket);
      const existing = {
        id: 'uuid-1',
        email: 'nueva@gmail.com',
        googleId: null,
        avatarUrl: null,
        isActive: true,
        roles: ['client'],
      };
      userRepository.findOne
        .mockResolvedValueOnce(null) // por googleId
        .mockResolvedValueOnce(existing); // por email
      userRepository.findOneByOrFail.mockResolvedValue({
        ...existing,
        googleId: 'google-123',
      });

      await service.loginWithGoogle('id-token');

      expect(userRepository.update).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({ googleId: 'google-123' }),
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('rechaza un token inválido', async () => {
      googleClient.verifyIdToken.mockRejectedValue(new Error('bad token'));

      await expect(service.loginWithGoogle('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rechaza un correo no verificado', async () => {
      googleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ ...payload, email_verified: false }),
      });

      await expect(service.loginWithGoogle('x')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
