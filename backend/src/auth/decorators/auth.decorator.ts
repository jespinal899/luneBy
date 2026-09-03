import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ValidRoles } from '../interfaces';
import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';

/**
 * Protege un endpoint: exige un JWT válido y, si se pasan roles, que el
 * usuario tenga al menos uno de ellos.
 *   @Auth()                 -> solo autenticado
 *   @Auth(ValidRoles.admin) -> autenticado y con rol admin
 */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
