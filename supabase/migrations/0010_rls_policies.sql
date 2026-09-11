-- 0010 · Políticas de acceso (RLS)
--
-- El backend (NestJS) se conecta con una cadena de sesión de Supabase que
-- actúa como propietario de las tablas, así que estas políticas no cambian
-- el comportamiento de la API actual (el propietario de una tabla nunca es
-- filtrado por RLS) — el control de acceso de la app hoy vive en los guards
-- de NestJS (`@Auth(ValidRoles.admin)`). Esta migración añade la capa de
-- políticas a nivel de base de datos para:
--   1. que el catálogo sea consultable directamente vía la API de Supabase
--      (PostgREST) sin exponer datos de otras tablas,
--   2. dejar preparado el cambio a Supabase Auth si algún día se usa
--      `auth.uid()` desde un cliente con el rol `authenticated`,
--   3. que la protección exista aunque cambie quién se conecta a la base.
--
-- Los roles `anon`/`authenticated` y el esquema `auth` (de donde sale
-- `auth.uid()`) los provee la plataforma de Supabase; no existen en un
-- Postgres vainilla como el que usa el CI (`postgres:16` + `psql`) para
-- validar el esquema. Por eso cada bloque comprueba que existan antes de
-- crear la policy — en Supabase se aplican; en CI/Postgres local se saltan
-- sin romper el `ON_ERROR_STOP=1`.
--
-- Idempotente: `drop policy if exists` + `create policy` dentro de cada chequeo.

-- ---------------------------------------------------------------------------
-- services — catálogo público de solo lectura
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'drop policy if exists "catalogo_publico_select" on public.services';
    execute $policy$
      create policy "catalogo_publico_select"
        on public.services
        for select
        to anon, authenticated
        using ("isActive" = true)
    $policy$;
  else
    raise notice 'Roles anon/authenticated no existen: se omite la policy de services (normal en Postgres local/CI).';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- users — cada usuario solo ve y edita su propio registro
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated')
     and exists (select 1 from pg_namespace where nspname = 'auth') then
    execute 'drop policy if exists "usuarios_select_propio" on public.users';
    execute $policy$
      create policy "usuarios_select_propio"
        on public.users
        for select
        to authenticated
        using (auth.uid() = id)
    $policy$;

    execute 'drop policy if exists "usuarios_update_propio" on public.users';
    execute $policy$
      create policy "usuarios_update_propio"
        on public.users
        for update
        to authenticated
        using (auth.uid() = id)
        with check (auth.uid() = id)
    $policy$;
  else
    raise notice 'Rol authenticated / esquema auth no existen: se omiten las policies de users (normal en Postgres local/CI).';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- appointments — cada clienta solo ve y crea sus propias citas
-- ---------------------------------------------------------------------------
alter table public.appointments enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated')
     and exists (select 1 from pg_namespace where nspname = 'auth') then
    execute 'drop policy if exists "citas_select_propias" on public.appointments';
    execute $policy$
      create policy "citas_select_propias"
        on public.appointments
        for select
        to authenticated
        using (auth.uid() = "userId")
    $policy$;

    execute 'drop policy if exists "citas_insert_propias" on public.appointments';
    execute $policy$
      create policy "citas_insert_propias"
        on public.appointments
        for insert
        to authenticated
        with check (auth.uid() = "userId")
    $policy$;
  else
    raise notice 'Rol authenticated / esquema auth no existen: se omiten las policies de appointments (normal en Postgres local/CI).';
  end if;
end $$;
