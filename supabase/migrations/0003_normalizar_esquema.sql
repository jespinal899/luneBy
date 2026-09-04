-- 0003 · Normalización del esquema
--
-- La base pasó de migraciones de TypeORM a la CLI de Supabase. En el proyecto
-- en la nube quedaron restos de la etapa anterior que este script limpia:
--   · la tabla `migrations` (el registro interno de TypeORM, ya no se usa);
--   · claves foráneas e índice duplicados en `appointments`;
--   · nombres de constraint autogenerados (`PK_...`, `UQ_...`) → nombres legibles.
--
-- Idempotente: todo va con `if exists` / comprobación de `pg_constraint`. En una
-- base creada desde cero (que ya tiene los nombres limpios) no hace nada.

-- ---------------------------------------------------------------------------
-- 1. Tabla interna de TypeORM (huérfana)
-- ---------------------------------------------------------------------------
drop table if exists public.migrations;

-- ---------------------------------------------------------------------------
-- 2. Duplicados en appointments (FKs e índice repetidos)
-- ---------------------------------------------------------------------------
alter table public.appointments drop constraint if exists "FK_01733651151c8a1d6d980135cc4";
alter table public.appointments drop constraint if exists "FK_f77953c373efb8ab146d98e90c3";
drop index if exists public."IDX_0239be264fb7385ca6907153b6";

-- ---------------------------------------------------------------------------
-- 3. Renombrar constraints autogenerados a nombres legibles
-- ---------------------------------------------------------------------------
do $$
declare
  pares text[][] := array[
    ['users',              'PK_a3ffb1c0c8416b9fc6f907b7433', 'pk_users'],
    ['users',              'UQ_97672ac88f789774dd47f7c8be3', 'uq_users_email'],
    ['services',           'PK_ba2d347a3168a296416c6c5ccb2', 'pk_services'],
    ['services',           'UQ_019d74f7abcdcb5a0113010cb03', 'uq_services_name'],
    ['services',           'UQ_02cf0d0f46e11d22d952f623670', 'uq_services_slug'],
    ['appointments',       'PK_4a437a9a27e948726b8bb3e36ad', 'pk_appointments'],
    ['availability_rules', 'PK_37dd3738c54ba3243cca374c2a1', 'pk_availability_rules'],
    ['time_off',           'PK_e80a790cc96026d0f557a78f83d', 'pk_time_off']
  ];
  i integer;
begin
  for i in 1 .. array_length(pares, 1) loop
    if exists (select 1 from pg_constraint where conname = pares[i][2])
       and not exists (select 1 from pg_constraint where conname = pares[i][3]) then
      execute format(
        'alter table public.%I rename constraint %I to %I',
        pares[i][1], pares[i][2], pares[i][3]
      );
    end if;
  end loop;
end $$;
