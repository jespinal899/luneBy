-- 0001 · Esquema inicial de Luné by Kelin
--
-- 5 tablas: users, services, appointments, availability_rules, time_off.
-- Idempotente: "create ... if not exists" + comprobación de pg_constraint
-- antes de cada clave foránea. Se puede aplicar varias veces sin romper nada.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid        not null default uuid_generate_v4(),
  email      text        not null,
  password   text        not null,
  "fullName" text        not null,
  phone      text,
  "isActive" boolean     not null default true,
  roles      text[]      not null default '{client}',
  constraint pk_users primary key (id),
  constraint uq_users_email unique (email)
);

-- ---------------------------------------------------------------------------
-- services (catálogo)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id            uuid              not null default uuid_generate_v4(),
  name          text              not null,
  price         double precision  not null default 0,
  description   text,
  category      text              not null,
  "durationMin" integer           not null default 60,
  image         text,
  slug          text              not null,
  "isActive"    boolean           not null default true,
  constraint pk_services primary key (id),
  constraint uq_services_name unique (name),
  constraint uq_services_slug unique (slug)
);

-- ---------------------------------------------------------------------------
-- appointments (citas)
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id          uuid       not null default uuid_generate_v4(),
  date        date       not null,
  "startTime" text       not null,
  "endTime"   text       not null,
  status      text       not null default 'pending',
  notes       text,
  "createdAt" timestamp  not null default now(),
  "serviceId" uuid,
  "userId"    uuid,
  constraint pk_appointments primary key (id)
);

create index if not exists idx_appointments_date_start
  on public.appointments (date, "startTime");

-- ---------------------------------------------------------------------------
-- availability_rules (horario recurrente de trabajo)
-- ---------------------------------------------------------------------------
create table if not exists public.availability_rules (
  id                uuid     not null default uuid_generate_v4(),
  weekday           integer  not null,          -- 0 = domingo ... 6 = sábado
  "startTime"       text     not null,
  "endTime"         text     not null,
  "slotIntervalMin" integer  not null default 30,
  "isActive"        boolean  not null default true,
  constraint pk_availability_rules primary key (id)
);

-- ---------------------------------------------------------------------------
-- time_off (bloqueos puntuales de agenda)
-- ---------------------------------------------------------------------------
create table if not exists public.time_off (
  id          uuid  not null default uuid_generate_v4(),
  date        date  not null,
  "startTime" text,                             -- null = día completo
  "endTime"   text,
  reason      text,
  constraint pk_time_off primary key (id)
);

-- ---------------------------------------------------------------------------
-- Claves foráneas de appointments
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fk_appointments_service') then
    alter table public.appointments
      add constraint fk_appointments_service
      foreign key ("serviceId") references public.services (id)
      on delete no action on update no action;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'fk_appointments_user') then
    alter table public.appointments
      add constraint fk_appointments_user
      foreign key ("userId") references public.users (id)
      on delete no action on update no action;
  end if;
end $$;
