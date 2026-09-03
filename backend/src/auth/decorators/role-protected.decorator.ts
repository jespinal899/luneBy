import { SetMetadata } from '@nestjs/common';

import { ValidRoles } from '../interfaces';

/** Clave de metadatos donde se guardan los roles permitidos de un handler. */
export const META_ROLES = 'roles';

/** Marca un handler con los roles que pueden ejecutarlo. Lo lee UserRoleGuard. */
export const RoleProtected = (...roles: ValidRoles[]) =>
  SetMetadata(META_ROLES, roles);
