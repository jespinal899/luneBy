import { join } from 'path';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { FilesModule } from './files/files.module';
import { SeedModule } from './seed/seed.module';

const buildDbOptions = (config: ConfigService): TypeOrmModuleOptions => {
  const common: TypeOrmModuleOptions = {
    type: 'postgres',
    autoLoadEntities: true,
    // El esquema se gestiona con migraciones (src/migrations), que se
    // aplican solas al arrancar. Nunca `synchronize`.
    synchronize: false,
    migrations: [join(__dirname, 'migrations', '*.js')],
    migrationsRun: true,
  };

  // Con `DATABASE_URL` (connection string del pooler de Supabase) se usa esa;
  // si no, se arma desde las variables `DB_*`.
  const url = config.get<string>('DATABASE_URL');
  if (url) {
    return { ...common, url, ssl: { rejectUnauthorized: false } };
  }

  const isProd = config.get('STAGE') === 'prod';
  return {
    ...common,
    host: config.get<string>('DB_HOST'),
    port: +config.get<string>('DB_PORT'),
    database: config.get<string>('DB_NAME'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    ssl: isProd,
    extra: isProd ? { ssl: { rejectUnauthorized: false } } : undefined,
  };
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 100 peticiones por minuto y por IP (global).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildDbOptions,
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
