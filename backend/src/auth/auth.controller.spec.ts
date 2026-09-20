import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { PasswordResetService } from './password-reset.service';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const service = {
    register: jest.fn(),
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    checkAuthStatus: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  const passwordReset = {
    requestCode: jest.fn(),
    verifyCode: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      // `@Auth()` evalua `AuthGuard()` al instanciar el controller: sin la
      // estrategia registrada, Nest avisa por consola en cada spec. Los tests
      // llaman a los metodos directo, asi que el guard nunca llega a correr.
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: PasswordResetService, useValue: passwordReset },
      ],
    }).compile();
    controller = moduleRef.get(AuthController);
  });

  it('register delega en el servicio', () => {
    const dto = { email: 'a@b.com' } as never;
    controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('login delega en el servicio', () => {
    const dto = { email: 'a@b.com', password: '123' } as never;
    controller.login(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('loginWithGoogle pasa el idToken', () => {
    controller.loginWithGoogle({ idToken: 'tok' });
    expect(service.loginWithGoogle).toHaveBeenCalledWith('tok');
  });

  it('checkAuthStatus delega en el servicio con el usuario', () => {
    const user = { id: '1' } as never;
    controller.checkAuthStatus(user);
    expect(service.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('updateProfile delega en el servicio', () => {
    const user = { id: '1' } as never;
    const dto = { fullName: 'Nueva' } as never;
    controller.updateProfile(user, dto);
    expect(service.updateProfile).toHaveBeenCalledWith(user, dto);
  });

  it('changePassword delega en el servicio', () => {
    const user = { id: '1' } as never;
    const dto = { oldPassword: 'a', newPassword: 'b' } as never;
    controller.changePassword(user, dto);
    expect(service.changePassword).toHaveBeenCalledWith(user, dto);
  });
});
