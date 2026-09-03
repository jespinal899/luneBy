import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRoleGuard } from './user-role.guard';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;

  const contextWithUser = (user: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => () => undefined,
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
  });

  it('permite el paso cuando el handler no declara roles', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    expect(guard.canActivate(contextWithUser({ roles: ['client'] }))).toBe(
      true,
    );
  });

  it('permite el paso cuando el usuario tiene un rol válido', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(
      guard.canActivate(
        contextWithUser({ fullName: 'Kelin', roles: ['admin'] }),
      ),
    ).toBe(true);
  });

  it('lanza ForbiddenException cuando el usuario no tiene el rol', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(() =>
      guard.canActivate(
        contextWithUser({ fullName: 'Clienta', roles: ['client'] }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('lanza BadRequestException cuando no hay usuario en la petición', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(() => guard.canActivate(contextWithUser(undefined))).toThrow(
      BadRequestException,
    );
  });
});
