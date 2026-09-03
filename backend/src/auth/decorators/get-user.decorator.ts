import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Inyecta el usuario autenticado (o una de sus propiedades) en un handler.
 *   @GetUser() user: User
 *   @GetUser('email') email: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        'Usuario no encontrado en la petición (¿falta el guard de autenticación?)',
      );

    return data ? user[data] : user;
  },
);
