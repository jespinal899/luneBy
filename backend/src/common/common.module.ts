import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdempotencyKey } from './entities/idempotency-key.entity';
import { DatabaseExceptionFilter } from './filters/database-exception.filter';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';

/**
 * Utilidades transversales:
 *  - `DatabaseExceptionFilter`: traduce errores de constraint de Postgres a
 *    respuestas 409 / 400 en lugar de un 500.
 *  - `IdempotencyInterceptor`: idempotencia opt-in por cabecera
 *    `Idempotency-Key` en las operaciones de escritura.
 *
 * Ambos se registran a nivel global (`APP_FILTER` / `APP_INTERCEPTOR`).
 */
@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyKey])],
  providers: [
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class CommonModule {}
