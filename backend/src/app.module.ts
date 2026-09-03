import { join } from 'path';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { FilesModule } from './files/files.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 100 peticiones por minuto y por IP (global).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.STAGE === 'prod',
      extra:
        process.env.STAGE === 'prod'
          ? { ssl: { rejectUnauthorized: false } }
          : undefined,
      autoLoadEntities: true,
      // El esquema se gestiona con migraciones (src/migrations), que se
      // aplican solas al arrancar. Nunca `synchronize`.
      synchronize: false,
      migrations: [join(__dirname, 'migrations', '*.js')],
      migrationsRun: true,
    }),

    CommonModule,
    AuthModule,
    ServicesModule,
    AppointmentsModule,
    FilesModule,
    SeedModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
