-- 0015 · RLS de las tablas nuevas (catálogo) y de las líneas de cita
--
-- Completa lo que dejó 0010, que cubría `services`, `users` y `appointments`.
-- Desde entonces se agregó `catalog_items` (0014), que quedó con RLS
-- habilitado pero sin ninguna política.
--
-- CÓMO LEER ESTO (importante):
--
--   La API de NestJS se conecta a Postgres como PROPIETARIO de las tablas,
--   y a un propietario RLS nunca lo filtra. O sea: estas políticas NO son
--   las que protegen el panel de administración — eso lo hacen los guards
--   de NestJS (`@Auth(ValidRoles.admin)`). Lo que protegen es la otra
--   puerta: la API REST que Supabase expone sola (PostgREST) con las
--   llaves `anon` / `authenticated`.
--
--   Criterio aplicado: denegar por defecto. Una tabla con RLS habilitado y
--   sin políticas no deja pasar nada por esa puerta, que es justo lo que
--   queremos para las tablas internas. Solo se abre lo que de verdad es
--   público.
--
--   `idempotency_keys`, `availability_rules` y `time_off` se dejan a
--   propósito SIN políticas: son internas o se sirven por la API de Nest,
--   así que no necesitan estar expuestas por PostgREST.
--
-- Los roles `anon`/`authenticated` y el esquema `auth` los provee la
-- plataforma de Supabase y no existen en el Postgres vainilla del CI; por
-- eso cada bloque comprueba que existan antes de crear la política.
--
-- Idempotente: `drop policy if exists` + `create policy` dentro del chequeo.

-- ---------------------------------------------------------------------------
-- catalog_items — lectura pública de los diseños visibles
-- ---------------------------------------------------------------------------
alter table public.catalog_items enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'drop policy if exists "catalogo_items_select_publico" on public.catalog_items';
    execute $policy$
      create policy "catalogo_items_select_publico"
        on public.catalog_items
        for select
        to anon, authenticated
        using (
          "isActive" = true
          and exists (
            select 1
            from public.services s
            where s.id = "serviceId"
              and s."isActive" = true
          )
        )
    $policy$;
  else
    raise notice 'Roles anon/authenticated no existen: se omite la policy de catalog_items (normal en Postgres local/CI).';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- appointment_items — cada clienta solo ve las líneas de SUS citas
-- ---------------------------------------------------------------------------
-- Nota honesta: hoy esta política nunca llega a dejar pasar nada, porque la
-- app no usa Supabase Auth (emite su propio JWT) y `auth.uid()` es NULL
-- para PostgREST. Queda escrita para que la regla sea explícita y para que
-- funcione tal cual si algún día se migra a Supabase Auth.
alter table public.appointment_items enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated')
     and exists (select 1 from pg_namespace where nspname = 'auth') then
    execute 'drop policy if exists "items_select_propios" on public.appointment_items';
    execute $policy$
      create policy "items_select_propios"
        on public.appointment_items
        for select
        to authenticated
        using (
          exists (
            select 1
            from public.appointments a
            where a.id = "appointmentId"
              and a."userId" = auth.uid()
          )
        )
    $policy$;
  else
    raise notice 'Rol authenticated / esquema auth no existen: se omite la policy de appointment_items (normal en Postgres local/CI).';
  end if;
end $$;
