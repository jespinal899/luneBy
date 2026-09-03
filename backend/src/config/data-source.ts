import 'reflect-metadata';

import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const isProd = process.env.STAGE === 'prod';

const base = {
  type: 'postgres' as const,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
};

/**
 * Si hay `DATABASE_URL` (p. ej. la connection string del pooler de Supabase)
 * se usa esa; si no, se arma a partir de las variables `DB_*`.
 */
const options: DataSourceOptions = process.env.DATABASE_URL
  ? {
      ...base,
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      ...base,
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: isProd,
      extra: isProd ? { ssl: { rejectUnauthorized: false } } : undefined,
    };

/** DataSource para la CLI de TypeORM (generar / correr / revertir migraciones). */
export const AppDataSource = new DataSource(options);
