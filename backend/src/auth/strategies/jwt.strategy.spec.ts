import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { JwtStrategy } from './jwt.strategy';
import { User } from '../entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const userRepository = { findOneBy: jest.fn() };
  const config = { get: jest.fn().mockReturnValue('secreto') };

  beforeEach(async () => {
    jest.clearAllMocks();
    config.get.mockReturnValue('secreto');
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    strategy = moduleRef.get(JwtStrategy);
  });

  it('devuelve el usuario si existe y está activo', async () => {
    const user = { id: '1', isActive: true };
    userRepository.findOneBy.mockResolvedValue(user);

    const res = await strategy.validate({ id: '1' } as never);

    expect(res).toBe(user);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
  });

  it('lanza UnauthorizedException si el usuario no existe', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(
      strategy.validate({ id: 'x' } as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el usuario está inactivo', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: '1', isActive: false });

    await expect(
      strategy.validate({ id: '1' } as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
