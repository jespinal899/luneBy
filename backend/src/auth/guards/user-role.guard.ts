import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    // Sin roles declarados: basta con estar autenticado.
    if (!validRoles || validRoles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as User;

    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (user.roles.some((role) => validRoles.includes(role))) return true;

    throw new ForbiddenException(
      `El usuario ${user.fullName} necesita uno de estos roles: [${validRoles}]`,
    );
  }
}
