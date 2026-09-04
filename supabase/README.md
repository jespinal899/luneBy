# supabase/

Esquema y datos de la base de datos de **Luné by Kelin**, gestionados con la
[CLI de Supabase](https://supabase.com/docs/guides/deployment/database-migrations).

```
supabase/
├── config.toml                     # enlaza con el proyecto en la nube
└── migrations/
    ├── 0001_esquema_inicial.sql    # 5 tablas + índice + claves foráneas
    └── 0002_datos_demo.sql         # usuarios, catálogo y horario base
```

Los scripts se aplican **en orden alfabético** y son **idempotentes**: correrlos
varias veces sobre la misma base de datos no rompe nada ni duplica filas.

| # | Archivo | Contenido |
| :- | :-- | :-- |
| 0001 | `esquema_inicial.sql` | Tablas `users`, `services`, `appointments`, `availability_rules`, `time_off`; índice `(date, startTime)`; FKs de `appointments`. `create ... if not exists` + guardas sobre `pg_constraint`. |
| 0002 | `datos_demo.sql` | 2 usuarios (`kelin@luneby.com` admin / `cliente@test.com`, contraseña `Abc123`), 8 servicios y el horario lunes–sábado 09:00–18:00 (slots de 30 min). `on conflict do nothing` / `where not exists`. |
| 0003 | `normalizar_esquema.sql` | Limpieza de la etapa TypeORM en el proyecto en la nube: borra la tabla `migrations`, los FKs e índice duplicados de `appointments` y renombra los constraints autogenerados (`PK_...`, `UQ_...`) a nombres legibles. No hace nada en una base creada desde cero. |

> Las citas y los bloqueos de agenda los crea la aplicación en runtime; no hay
> datos semilla para ellos.

---

## Requisitos

Instala la CLI (una vez):

```bash
npm i -g supabase          # o: scoop install supabase  /  brew install supabase/tap/supabase
supabase --version
```

Enlaza el repo con el proyecto en la nube (una vez):

```bash
supabase login             # abre el navegador
supabase link --project-ref fxlttpayjkkbfomveavx
```

## Aplicar las migraciones al proyecto en la nube

```bash
supabase db push
```

Aplica los archivos de `migrations/` que aún no estén registrados en la tabla
`supabase_migrations.schema_migrations` del proyecto. Como son idempotentes, es
seguro aunque el esquema ya exista (la primera vez que se ejecute sobre la base
actual, no cambiará nada).

## Crear una nueva migración

```bash
supabase migration new descripcion_del_cambio
# edita el .sql generado en supabase/migrations/
supabase db push
```

Numera el archivo siguiendo la serie (`0003_...`, `0004_...`). Escribe SQL
idempotente (`if not exists`, `on conflict`, `where not exists`).

## Entorno local (opcional)

```bash
supabase start             # levanta Postgres + Studio en Docker
supabase db reset          # recrea la BD local y aplica todas las migraciones
```

## Base de datos local sin la CLI

El backend usa un Postgres en Docker (`backend/docker-compose`). Para aplicar el
esquema ahí a mano:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_esquema_inicial.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_datos_demo.sql
```
