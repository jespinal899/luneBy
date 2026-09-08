-- 0007 · Servicios base + estilos y cotización por líneas
--
-- Un servicio ahora es de tipo 'base' (manicura, acrílico…) o 'estilo'
-- (francés, encapsulado…). Una cita tiene un servicio base y, opcionalmente,
-- varios estilos con cantidad; cada línea se congela en `appointment_items`.

-- ── services.kind ──────────────────────────────────────────────────
alter table public.services
  add column if not exists kind text not null default 'base';

alter table public.services
  drop constraint if exists services_kind_check;
alter table public.services
  add constraint services_kind_check check (kind in ('base', 'estilo'));

update public.services set kind = 'base' where kind is null;

-- ── appointments.durationMin ───────────────────────────────────────
alter table public.appointments
  add column if not exists "durationMin" int not null default 60;

-- ── appointment_items ──────────────────────────────────────────────
create table if not exists public.appointment_items (
  id uuid primary key default gen_random_uuid(),
  "appointmentId" uuid not null
    references public.appointments(id) on delete cascade,
  "serviceId" uuid references public.services(id) on delete set null,
  "nameAtBooking" text not null,
  "priceAtBooking" double precision not null default 0,
  kind text not null default 'estilo',
  quantity int not null default 1 check (quantity between 1 and 20),
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_appointment_items_appointment
  on public.appointment_items ("appointmentId");

-- ── Estilos de demo (se reemplazan luego con la lista real) ─────────
insert into public.services
  (name, price, description, category, "durationMin", slug, "isActive", kind)
values
  ('Francés clásico', 120, 'Punta blanca tradicional en todas las uñas', 'Estilo', 15, 'estilo-frances-clasico', true, 'estilo'),
  ('Ojo de gato', 150, 'Efecto magnético multidireccional', 'Estilo', 15, 'estilo-ojo-de-gato', true, 'estilo'),
  ('Encapsulado de glitter', 200, 'Brillo o flores encapsuladas en el acrílico', 'Estilo', 25, 'estilo-encapsulado-glitter', true, 'estilo'),
  ('Efecto espejo / aura', 180, 'Cromado metálico o degradado aura', 'Estilo', 20, 'estilo-efecto-espejo', true, 'estilo'),
  ('Nail art a mano alzada (por uña)', 90, 'Diseño personalizado pintado a mano, precio por uña', 'Estilo', 10, 'estilo-nail-art-mano-alzada', true, 'estilo'),
  ('Pedrería y joyas (por uña)', 60, 'Aplicación de cristales y charms, precio por uña', 'Estilo', 8, 'estilo-pedreria-joyas', true, 'estilo')
on conflict (slug) do nothing;
