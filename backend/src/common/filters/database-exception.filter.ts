import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/** Mensaje específico según el constraint que se violó. */
const BY_CONSTRAINT: Record<string, string> = {
  uq_users_email: 'Ese correo ya está registrado',
  uq_services_name: 'Ya existe un servicio con ese nombre',
  uq_services_slug: 'Ya existe un servicio con ese identificador',
  no_overlap_citas: 'Ese horario ya está reservado',
  pk_idempotency_keys: 'Solicitud duplicada',
};

/** Mensaje por defecto según el código de error de PostgreSQL. */
const BY_CODE: Record<string, () => HttpException> = {
  '23505': () => new ConflictException('Ya existe un registro con esos datos'),
  '23P01': () => new ConflictException('Ese horario ya está reservado'),
  '23503': () =>
    new BadRequestException('El recurso relacionado no existe o está en uso'),
  '23514': () =>
    new BadRequestException('Los datos no cumplen una restricción'),
  '23502': () => new BadRequestException('Falta un campo obligatorio'),
};

/**
 * Convierte los errores de constraint de PostgreSQL en respuestas HTTP claras
 * (409 / 400) en lugar de un 500 genérico, y sin filtrar detalles internos de
 * la base de datos. Hace que reintentar una operación duplicada sea seguro y
 * con un mensaje entendible.
 */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DatabaseException');

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const err = exception as unknown as {
      code?: string;
      constraint?: string;
      driverError?: { constraint?: string };
    };
    const code = err.code ?? '';
    const constraint = err.constraint ?? err.driverError?.constraint;

    const build = BY_CODE[code];
    if (!build) {
      this.logger.error(
        `Error de BD no mapeado (${code}): ${exception.message}`,
        exception.stack,
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno',
        error: 'Internal Server Error',
      });
    }

    const specific = constraint ? BY_CONSTRAINT[constraint] : undefined;
    const http =
      code === '23505' && specific ? new ConflictException(specific) : build();

    res.status(http.getStatus()).json(http.getResponse());
  }
}
