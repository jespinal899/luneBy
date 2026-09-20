import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  changePasswordRequest,
  checkStatusRequest,
  forgotPasswordRequest,
  googleLoginRequest,
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  updateProfileRequest,
  verifyResetCodeRequest,
} from './auth.actions';

// Cada acción es una envoltura fina sobre `http`: lo que hay que fijar es la
// ruta, el cuerpo que se manda y que devuelva `data` pelado (no la respuesta
// de axios entera), que es lo que consumen las pantallas.
vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { http } = await import('@/api/http');
const post = vi.mocked(http.post);
const get = vi.mocked(http.get);
const patch = vi.mocked(http.patch);

const respuesta = <T>(data: T) => ({ data }) as never;

describe('auth.actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loginRequest manda las credenciales y devuelve la sesión', async () => {
    post.mockResolvedValue(respuesta({ token: 'jwt-1' }));

    const data = await loginRequest({ email: 'a@b.com', password: 'Abc123' });

    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.com',
      password: 'Abc123',
    });
    expect(data).toEqual({ token: 'jwt-1' });
  });

  it('registerRequest manda el alta completa', async () => {
    post.mockResolvedValue(respuesta({ token: 'jwt-2' }));

    const data = await registerRequest({
      fullName: 'Kelin',
      email: 'k@b.com',
      password: 'Abc123',
      phone: '9999-9999',
    });

    expect(post).toHaveBeenCalledWith('/auth/register', {
      fullName: 'Kelin',
      email: 'k@b.com',
      password: 'Abc123',
      phone: '9999-9999',
    });
    expect(data).toEqual({ token: 'jwt-2' });
  });

  it('googleLoginRequest envuelve el idToken en el cuerpo', async () => {
    post.mockResolvedValue(respuesta({ token: 'jwt-3' }));

    await googleLoginRequest('id-token-de-google');

    expect(post).toHaveBeenCalledWith('/auth/google', {
      idToken: 'id-token-de-google',
    });
  });

  it('checkStatusRequest revalida contra el endpoint de sesión', async () => {
    get.mockResolvedValue(respuesta({ token: 'jwt-fresco' }));

    const data = await checkStatusRequest();

    expect(get).toHaveBeenCalledWith('/auth/check-status');
    expect(data).toEqual({ token: 'jwt-fresco' });
  });

  it('updateProfileRequest usa PATCH sobre el perfil', async () => {
    patch.mockResolvedValue(respuesta({ token: 'jwt-4' }));

    await updateProfileRequest({ fullName: 'Kelin R.' });

    expect(patch).toHaveBeenCalledWith('/auth/profile', {
      fullName: 'Kelin R.',
    });
  });

  it('changePasswordRequest manda la actual y la nueva', async () => {
    patch.mockResolvedValue(respuesta({ message: 'ok' }));

    const data = await changePasswordRequest({
      currentPassword: 'vieja',
      newPassword: 'nueva',
    });

    expect(patch).toHaveBeenCalledWith('/auth/password', {
      currentPassword: 'vieja',
      newPassword: 'nueva',
    });
    expect(data).toEqual({ message: 'ok' });
  });

  describe('recuperación de contraseña', () => {
    it('paso 1: forgotPasswordRequest pide el código por correo', async () => {
      post.mockResolvedValue(respuesta({ message: 'Si existe, te llega' }));

      const data = await forgotPasswordRequest('a@b.com');

      expect(post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'a@b.com',
      });
      expect(data).toEqual({ message: 'Si existe, te llega' });
    });

    it('paso 2: verifyResetCodeRequest devuelve el comprobante', async () => {
      post.mockResolvedValue(respuesta({ resetToken: 'tok-reset' }));

      const data = await verifyResetCodeRequest('a@b.com', '123456');

      expect(post).toHaveBeenCalledWith('/auth/verify-reset-code', {
        email: 'a@b.com',
        code: '123456',
      });
      expect(data.resetToken).toBe('tok-reset');
    });

    it('paso 3: resetPasswordRequest guarda la contraseña nueva', async () => {
      post.mockResolvedValue(respuesta({ message: 'Lista' }));

      await resetPasswordRequest('tok-reset', 'NuevaClave1');

      expect(post).toHaveBeenCalledWith('/auth/reset-password', {
        resetToken: 'tok-reset',
        newPassword: 'NuevaClave1',
      });
    });
  });
});
