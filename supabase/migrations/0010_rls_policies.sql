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
-- Idempotente: `drop policy if exists` + `create policy`.

-- ---------------------------------------------------------------------------
-- services — catálogo público de solo lectura
-- ---------------------------------------------------------------------------
alter table public.services enable row level security;

drop policy if exists "catalogo_publico_select" on public.services;
create policy "catalogo_publico_select"
  on public.services
  for select
  to anon, authenticated
  using ("isActive" = true);

-- ---------------------------------------------------------------------------
-- users — cada usuario solo ve y edita su propio registro
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "usuarios_select_propio" on public.users;
create policy "usuarios_select_propio"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "usuarios_update_propio" on public.users;
create policy "usuarios_update_propio"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- appointments — cada clienta solo ve y crea sus propias citas
-- ---------------------------------------------------------------------------
alter table public.appointments enable row level security;

drop policy if exists "citas_select_propias" on public.appointments;
create policy "citas_select_propias"
  on public.appointments
  for select
  to authenticated
  using (auth.uid() = "userId");

drop policy if exists "citas_insert_propias" on public.appointments;
create policy "citas_insert_propias"
  on public.appointments
  for insert
  to authenticated
  with check (auth.uid() = "userId");
