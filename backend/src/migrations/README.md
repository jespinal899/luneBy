# Migraciones

Scripts de esquema y datos, **en orden** y **idempotentes**: correrlos varias
veces sobre la misma base de datos no rompe nada ni duplica filas.

TypeORM los ejecuta ordenados por el número (timestamp) del nombre. Al arrancar
la API se aplican los pendientes automáticamente (`migrationsRun: true`).

| # | Archivo | Qué hace |
| :- | :-- | :-- |
| 01 | `1788455510914-InitialSchema.ts` | Crea las 5 tablas (`users`, `services`, `appointments`, `availability_rules`, `time_off`), el índice `(date, startTime)` y las 2 claves foráneas de `appointments`. `CREATE ... IF NOT EXISTS` + comprobación de `pg_constraint`. |
| 02 | `1790000000000-SeedBaseData.ts` | Inserta los datos base: 2 usuarios (`kelin@luneby.com` admin, `cliente@test.com`), 8 servicios del catálogo y el horario de trabajo (lunes–sábado 09:00–18:00, slots de 30 min). `ON CONFLICT DO NOTHING` en usuarios y servicios; `WHERE NOT EXISTS` en el horario. |

Las citas (`appointments`) y los bloqueos de agenda (`time_off`) los crea la
aplicación en runtime; no hay datos semilla para ellos.

## Comandos

```bash
npm run migration:run      # aplica las pendientes
npm run migration:revert   # deshace la última
npm run build              # compila los .ts a dist/migrations/*.js (los que usa la API al arrancar)
```

Tras cambiar una entidad, generar el diff y formatearlo:

```bash
npm run migration:generate -- src/migrations/DescripcionDelCambio
npx prettier --write "src/migrations/*.ts"
```

## Datos vs. `npm run seed`

- **Migración 02** = datos mínimos para que la app funcione (catálogo + horario).
  Se aplican en cualquier entorno, incluido producción, sin borrar nada.
- **`npm run seed`** = **reset** de desarrollo: borra todo y reinserta.
  No usarlo en producción.
