import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { MailService } from '../mail/mail.service';
import { PasswordReset } from './entities/password-reset.entity';
import { User } from './entities/user.entity';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  const userRepository = {
    findOneBy: jest.fn(),
    countBy: jest.fn(),
    update: jest.fn(),
  };
  const resetRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn((x: unknown) => x),
  };
  const mailService = {
    sendPasswordResetCode: jest.fn(),
    sendGoogleAccountNotice: jest.fn(),
  };
  const jwtService = { sign: jest.fn(() => 'tok'), verify: jest.fn() };

  const kelin = { id: 'u1', email: 'a@b.com', isActive: true } as User;

  const inFuture = () => new Date(Date.now() + 10 * 60_000);

  const makeReset = async (over: Partial<PasswordReset> = {}) =>
    ({
      id: 'r1',
      user: kelin,
      codeHash: await bcrypt.hash('123456', 4),
      expiresAt: inFuture(),
      attempts: 0,
      verifiedAt: null,
      usedAt: null,
      createdAt: new Date(),
      ...over,
    }) as PasswordReset;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepository.countBy.mockResolvedValue(1); // tiene contraseña local

    const moduleRef = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(PasswordReset),
          useValue: resetRepository,
        },
        { provide: MailService, useValue: mailService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(PasswordResetService);
  });

  describe('requestCode', () => {
    it('envía un código cuando la cuenta existe', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);

      await service.requestCode({ email: 'a@b.com' });

      expect(mailService.sendPasswordResetCode).toHaveBeenCalledWith(
        'a@b.com',
        expect.stringMatching(/^\d{6}$/),
        expect.any(Number),
      );
    });

    // El código vale tanto como la cuenta: si se guardara en claro, leer la
    // base alcanzaría para entrar a cualquiera.
    it('guarda el código hasheado, nunca en claro', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);

      await service.requestCode({ email: 'a@b.com' });

      const [, code] = mailService.sendPasswordResetCode.mock.calls[0];
      const guardado = resetRepository.save.mock.calls[0][0] as PasswordReset;

      expect(guardado.codeHash).not.toBe(code);
      await expect(bcrypt.compare(code, guardado.codeHash)).resolves.toBe(true);
    });

    // Pedir uno nuevo suele pasar porque el anterior no llegó; dejarlos vivos
    // sería dejar varias puertas abiertas a la vez.
    it('invalida los códigos anteriores de esa cuenta', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);

      await service.requestCode({ email: 'a@b.com' });

      expect(resetRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ user: { id: 'u1' } }),
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });

    /**
     * Si la respuesta cambiara según exista o no el correo, el formulario
     * serviría para averiguar qué personas tienen cuenta en el salón.
     */
    it('responde igual aunque el correo no exista', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      const conCuenta = await service.requestCode({ email: 'a@b.com' });

      jest.clearAllMocks();
      userRepository.findOneBy.mockResolvedValue(null);
      const sinCuenta = await service.requestCode({ email: 'nadie@b.com' });

      expect(sinCuenta).toEqual(conCuenta);
      expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('a una cuenta de Google le explica que entre con Google', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      userRepository.countBy.mockResolvedValue(0); // sin contraseña local

      await service.requestCode({ email: 'a@b.com' });

      expect(mailService.sendGoogleAccountNotice).toHaveBeenCalledWith(
        'a@b.com',
      );
      expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
    });

    it('no manda nada a una cuenta desactivada', async () => {
      userRepository.findOneBy.mockResolvedValue({ ...kelin, isActive: false });

      await service.requestCode({ email: 'a@b.com' });

      expect(mailService.sendPasswordResetCode).not.toHaveBeenCalled();
    });
  });

  describe('verifyCode', () => {
    it('con el código correcto entrega el comprobante', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      resetRepository.findOne.mockResolvedValue(await makeReset());

      const res = await service.verifyCode({
        email: 'a@b.com',
        code: '123456',
      });

      expect(res.resetToken).toBe('tok');
      // El comprobante dice para qué sirve: un JWT de sesión no debe valer acá.
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'password-reset', rid: 'r1' }),
        expect.anything(),
      );
    });

    it('rechaza un código incorrecto y cuenta el intento', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      const reset = await makeReset();
      resetRepository.findOne.mockResolvedValue(reset);

      await expect(
        service.verifyCode({ email: 'a@b.com', code: '000000' }),
      ).rejects.toThrow(BadRequestException);
      expect(reset.attempts).toBe(1);
    });

    // Un millón de combinaciones se prueban en minutos si se deja intentar
    // sin tope.
    it('al agotar los intentos quema el código', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      const reset = await makeReset({ attempts: 4 });
      resetRepository.findOne.mockResolvedValue(reset);

      await expect(
        service.verifyCode({ email: 'a@b.com', code: '000000' }),
      ).rejects.toThrow(BadRequestException);

      expect(reset.usedAt).toBeInstanceOf(Date);
    });

    it('rechaza un código vencido', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      resetRepository.findOne.mockResolvedValue(
        await makeReset({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(
        service.verifyCode({ email: 'a@b.com', code: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('sin código pedido, no dice que no lo hay', async () => {
      userRepository.findOneBy.mockResolvedValue(kelin);
      resetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyCode({ email: 'a@b.com', code: '123456' }),
      ).rejects.toThrow(/no es válido o ya venció/);
    });
  });

  describe('resetPassword', () => {
    const verificado = { sub: 'u1', purpose: 'password-reset', rid: 'r1' };

    it('guarda la contraseña nueva hasheada y quema el código', async () => {
      jwtService.verify.mockReturnValue(verificado);
      const reset = await makeReset({ verifiedAt: new Date() });
      resetRepository.findOne.mockResolvedValue(reset);

      await service.resetPassword({
        resetToken: 'tok',
        newPassword: 'NuevaClave1',
      });

      const [id, cambios] = userRepository.update.mock.calls[0];
      expect(id).toBe('u1');
      expect(cambios.password).not.toBe('NuevaClave1');
      await expect(
        bcrypt.compare('NuevaClave1', cambios.password),
      ).resolves.toBe(true);
      expect(reset.usedAt).toBeInstanceOf(Date);
    });

    /**
     * Sin esta comprobación, un JWT de sesión normal —firmado con el mismo
     * secreto— serviría para saltarse el código por completo.
     */
    it('no acepta un token que no sea de recuperación', async () => {
      jwtService.verify.mockReturnValue({ sub: 'u1', purpose: 'login' });

      await expect(
        service.resetPassword({
          resetToken: 'tok',
          newPassword: 'NuevaClave1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('no acepta un código que no llegó a verificarse', async () => {
      jwtService.verify.mockReturnValue(verificado);
      resetRepository.findOne.mockResolvedValue(
        await makeReset({ verifiedAt: null }),
      );

      await expect(
        service.resetPassword({
          resetToken: 'tok',
          newPassword: 'NuevaClave1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('no deja reusar un código ya usado', async () => {
      jwtService.verify.mockReturnValue(verificado);
      resetRepository.findOne.mockResolvedValue(
        await makeReset({ verifiedAt: new Date(), usedAt: new Date() }),
      );

      await expect(
        service.resetPassword({
          resetToken: 'tok',
          newPassword: 'NuevaClave1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
