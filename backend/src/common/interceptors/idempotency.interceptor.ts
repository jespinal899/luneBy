import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Observable, from, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '../entities/idempotency-key.entity';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const KEY_FORMAT = /^[A-Za-z0-9_.:-]{8,255}$/;
const IN_PROGRESS =
  'Ya hay una solicitud en curso con esa Idempotency-Key, reinténtalo en unos segundos';

/**
 * Idempotencia opt-in por cabecera `Idempotency-Key`.
 *
 * En una operación de escritura que trae esa cabecera:
 *  - primera vez  → ejecuta y guarda `{ statusCode, response }` bajo la key;
 *  - reintento    → devuelve la respuesta guardada sin volver a ejecutar;
 *  - en paralelo   → la segunda recibe 409 mientras la primera no termina.
 *
 * Si el handler falla, la key se libera para que el cliente pueda reintentar.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Idempotency');

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(IdempotencyKey)
    private readonly repo: Repository<IdempotencyKey>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: string } }>();
    const res = context.switchToHttp().getResponse<Response>();

    if (!WRITE_METHODS.has(req.method)) return next.handle();

    const key = req.header('Idempotency-Key');
    if (!key) return next.handle();
    if (!KEY_FORMAT.test(key)) {
      throw new BadRequestException('Idempotency-Key con formato inválido');
    }

    const replayed = await this.tryReplay(key, res);
    if (replayed) return replayed;

    try {
      await this.repo.insert({
        key,
        userId: req.user?.id ?? null,
        method: req.method,
        path: req.path,
      });
    } catch {
      // Otra request reclamó la misma key entre el findOne y el insert.
      const replay = await this.tryReplay(key, res);
      if (replay) return replay;
      throw new ConflictException(IN_PROGRESS);
    }

    const status = this.resolveStatus(context, req.method);

    return next.handle().pipe(
      concatMap((body) =>
        from(
          this.repo.update(
            { key },
            {
              response: (body ?? null) as object,
              statusCode: status,
              completedAt: new Date(),
            },
          ),
        ).pipe(map(() => body)),
      ),
      catchError((err) =>
        from(this.repo.delete({ key })).pipe(
          concatMap(() => {
            throw err;
          }),
        ),
      ),
    );
  }

  /** Si la key ya existe: respuesta guardada, o 409 si sigue en curso. */
  private async tryReplay(
    key: string,
    res: Response,
  ): Promise<Observable<unknown> | null> {
    const existing = await this.repo.findOne({ where: { key } });
    if (!existing) return null;

    if (!existing.completedAt) throw new ConflictException(IN_PROGRESS);

    res.status(existing.statusCode ?? 200);
    res.setHeader('Idempotency-Replayed', 'true');
    this.logger.log(
      `Reintento idempotente: ${existing.method} ${existing.path}`,
    );
    return of(existing.response ?? null);
  }

  /** Código HTTP que devolverá el handler (`@HttpCode` o el default del verbo). */
  private resolveStatus(context: ExecutionContext, method: string): number {
    const override = this.reflector.get<number>(
      HTTP_CODE_METADATA,
      context.getHandler(),
    );
    if (override) return override;
    return method === 'POST' ? 201 : 200;
  }
}
