-- 0004 · Integridad de datos
--
--   1. Sin solapamiento de citas: un mismo tramo horario no puede tener dos
--      citas activas (el estudio es de una sola manicurista).
--   2. CHECKs: estados, precios, duraciones y días de la semana válidos.
--   3. `priceAtBooking`: precio del servicio congelado en el momento de reservar.
--
-- Idempotente: `if not exists` / comprobación de `pg_constraint`.

-- ---------------------------------------------------------------------------
-- 1. Exclusión de solapamiento en appointments
-- ---------------------------------------------------------------------------
create extension if not exists btree_gist;

-- Las horas se guardan como texto "HH:mm". Esta función las convierte al
-- rango de tiempo de la cita; marcada IMMUTABLE para poder usarla en el índice
-- del constraint de exclusión.
create or replace function public.rango_cita(d date, inicio text, fin text)
returns tsrange
language sql
immutable
as $$
  select tsrange(
    d::timestamp + make_interval(
      hours => split_part(inicio, ':', 1)::int,
      mins  => split_part(inicio, ':', 2)::int
    ),
    d::timestamp + make_interval(
      hours => split_part(fin, ':', 1)::int,
      mins  => split_part(fin, ':', 2)::int
    )
  )
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'no_overlap_citas') then
    alter table public.appointments
      add constraint no_overlap_citas
      exclude using gist (
        public.rango_cita("date", "startTime", "endTime") with &&
      )
      where (status <> 'cancelled');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. CHECK constraints
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_appointments_status') then
    alter table public.appointments add constraint chk_appointments_status
      check (status in ('pending', 'confirmed', 'cancelled', 'done'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_appointments_times') then
    alter table public.appointments add constraint chk_appointments_times
      check ("endTime"::time > "startTime"::time);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_services_price') then
    alter table public.services add constraint chk_services_price
      check (price >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_services_duration') then
    alter table public.services add constraint chk_services_duration
      check ("durationMin" > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_availability_weekday') then
    alter table public.availability_rules add constraint chk_availability_weekday
      check (weekday between 0 and 6);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_availability_slot') then
    alter table public.availability_rules add constraint chk_availability_slot
      check ("slotIntervalMin" > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_users_roles') then
    alter table public.users add constraint chk_users_roles
      check (roles <@ array['admin', 'client']::text[]);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Precio congelado al reservar
-- ---------------------------------------------------------------------------
alter table public.appointments
  add column if not exists "priceAtBooking" double precision;
