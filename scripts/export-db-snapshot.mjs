/**
 * Regenera `docs/db-export.json`: la foto del modelo de datos real
 * (tablas, columnas, PKs, índices, llaves foráneas, políticas RLS y cuántas
 * filas tiene cada tabla).
 *
 * Existía el archivo pero no cómo rehacerlo, así que quedaba desactualizado
 * en cuanto una migración agregaba algo. Esto lo vuelve repetible.
 *
 * Solo lee: consulta los catálogos de Postgres y cuenta filas. No escribe
 * nada en la base, y no saca ningún dato de las tablas — solo el número de
 * filas, que es lo que el archivo ya documentaba.
 *
 * Contra la base real (la que documenta el archivo):
 *
 *   DATABASE_URL="postgresql://...supabase.com:5432/postgres"  *     node scripts/export-db-snapshot.mjs
 *
 * Sin `DATABASE_URL` cae a `backend/.env` (DB_HOST, DB_PORT, DB_NAME,
 * DB_USERNAME, DB_PASSWORD), que apunta a la base local de desarrollo —
 * sirve para probar el script, pero sus conteos no son los de producción.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from '../backend/node_modules/pg/lib/index.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Lee backend/.env sin depender de dotenv. */
const readEnv = () => {
  const raw = readFileSync(join(ROOT, 'backend/.env'), 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
};

const QUERIES = {
  tablas: `
    select tablename as nombre
    from pg_tables
    where schemaname = 'public'
    order by tablename`,

  columnas: `
    select
      c.table_name as tabla,
      c.column_name as nombre,
      c.data_type as tipo,
      c.is_nullable = 'YES' as nulo,
      coalesce(pk.es_pk, false) as pk
    from information_schema.columns c
    left join (
      select kcu.table_name, kcu.column_name, true as es_pk
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on kcu.constraint_name = tc.constraint_name
       and kcu.table_schema = tc.table_schema
      where tc.table_schema = 'public'
        and tc.constraint_type = 'PRIMARY KEY'
    ) pk on pk.table_name = c.table_name and pk.column_name = c.column_name
    where c.table_schema = 'public'
    order by c.table_name, c.ordinal_position`,

  indices: `
    select tablename as tabla, indexname as nombre
    from pg_indexes
    where schemaname = 'public'
    order by tablename, indexname`,

  // La exclusión de solapamiento de citas es una constraint, no un índice de
  // pg_indexes, pero cuenta como tal para lo que documenta el archivo.
  exclusiones: `
    select rel.relname as tabla, con.conname as nombre
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public' and con.contype = 'x'
    order by rel.relname, con.conname`,

  relaciones: `
    select
      tc.table_name as tabla,
      kcu.column_name as columna,
      ccu.table_name as tabla_referida,
      ccu.column_name as columna_referida
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = tc.constraint_name
     and kcu.table_schema = tc.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.table_schema = tc.table_schema
    where tc.table_schema = 'public'
      and tc.constraint_type = 'FOREIGN KEY'
    order by tc.table_name, kcu.column_name`,

  politicas: `
    select tablename as tabla, policyname as nombre
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname`,
};

const agrupar = (filas, clave, valor) => {
  const mapa = new Map();
  for (const fila of filas) {
    const k = fila[clave];
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(valor(fila));
  }
  return mapa;
};

/** `DATABASE_URL` manda; si no está, se usa lo de backend/.env. */
const buildClient = () => {
  if (process.env.DATABASE_URL) {
    return new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  const env = readEnv();
  return new pg.Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 5432),
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
};

const main = async () => {
  const client = buildClient();

  await client.connect();
  try {
    const resultados = {};
    for (const [nombre, sql] of Object.entries(QUERIES)) {
      resultados[nombre] = (await client.query(sql)).rows;
    }

    const columnasPorTabla = agrupar(resultados.columnas, 'tabla', (c) => ({
      nombre: c.nombre,
      tipo: c.tipo,
      pk: c.pk,
      nulo: c.nulo,
    }));
    const indicesPorTabla = agrupar(
      [...resultados.indices, ...resultados.exclusiones],
      'tabla',
      (i) => i.nombre,
    );
    const relacionesPorTabla = agrupar(resultados.relaciones, 'tabla', (r) => ({
      columna: r.columna,
      referencia: `${r.tabla_referida}.${r.columna_referida}`,
    }));
    const politicasPorTabla = agrupar(
      resultados.politicas,
      'tabla',
      (p) => p.nombre,
    );

    const tablas = [];
    for (const { nombre } of resultados.tablas) {
      // El nombre viene del catálogo de Postgres, no de una entrada externa.
      const { rows } = await client.query(
        `select count(*)::int as filas from public."${nombre}"`,
      );
      tablas.push({
        nombre,
        filas: rows[0].filas,
        columnas: columnasPorTabla.get(nombre) ?? [],
        indices: [...new Set(indicesPorTabla.get(nombre) ?? [])].sort(),
        relaciones: relacionesPorTabla.get(nombre) ?? [],
        politicas_rls: politicasPorTabla.get(nombre) ?? [],
      });
    }

    const salida = {
      generado_at: new Date().toISOString(),
      motor: 'postgres',
      tablas,
    };

    const destino = join(ROOT, 'docs/db-export.json');
    writeFileSync(destino, `${JSON.stringify(salida, null, 2)}\n`);

    const conFilas = tablas.filter((t) => t.filas > 0).length;
    const relaciones = tablas.reduce((n, t) => n + t.relaciones.length, 0);
    const indices = tablas.reduce((n, t) => n + t.indices.length, 0);
    console.log(
      `${tablas.length} tablas · ${conFilas} con filas · ${relaciones} relaciones · ${indices} índices → docs/db-export.json`,
    );
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error(`No se pudo generar el snapshot: ${error.message}`);
  if (error.code === 'ECONNREFUSED' && !process.env.DATABASE_URL) {
    console.error(
      [
        'No hay ninguna base en esa dirección.',
        'Para la base real, pasa la conexión de Supabase:',
        '  DATABASE_URL="postgresql://postgres:<clave>@<host>:5432/postgres" node scripts/export-db-snapshot.mjs',
      ].join('\n'),
    );
  }
  process.exit(1);
});
