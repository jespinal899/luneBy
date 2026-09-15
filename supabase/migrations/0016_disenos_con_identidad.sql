-- 0016 · El diseño deja de heredar nombre y precio del servicio
--
-- Hasta acá `catalog_items` solo guardaba la foto y la descripción: el nombre
-- y el precio se tomaban prestados del servicio al mostrarlo. Eso obligaba a
-- crear un servicio nuevo por cada diseño, porque un diseño no podía llamarse
-- distinto que su servicio.
--
-- El modelo real del negocio es Servicio 1 → N Diseños:
--
--   Esmaltado        → Soft Glam, French, Cat Eye, Chrome
--   Uñas acrílicas   → Baby Boomer, French, Almendra
--
-- La relación ya existía (la FK `serviceId`); lo que faltaba era que el
-- diseño tuviera atributos propios. La duración se sigue heredando del
-- servicio: es lo que usa el motor de disponibilidad para calcular horarios.
--
-- Idempotente: se puede aplicar sobre una base nueva (CI) y sobre la de
-- producción, que ya tiene filas.

-- 1. Columnas nuevas, nullable de entrada para no romper las filas existentes.
alter table public.catalog_items
  add column if not exists "name" text;

alter table public.catalog_items
  add column if not exists "price" double precision;

-- 2. Los diseños que ya existen heredan, una única vez, lo que hasta ahora
--    mostraban prestado. Así ninguno queda sin nombre ni a precio cero.
-- Si un servicio tiene varios diseños, todos heredarían el mismo nombre y
--    chocarían contra el índice único del paso 5. Se numeran para que la
--    migración no falle: "Esmaltado", "Esmaltado 2", "Esmaltado 3"…
--    Kelin los renombra después desde el panel.
with heredados as (
  select
    ci.id,
    s.name as base,
    row_number() over (
      partition by ci."serviceId" order by ci."createdAt", ci.id
    ) as orden
  from public.catalog_items ci
  join public.services s on s.id = ci."serviceId"
  where ci."name" is null
)
update public.catalog_items ci
set "name" = case
  when h.orden = 1 then h.base
  else h.base || ' ' || h.orden
end
from heredados h
where ci.id = h.id;

update public.catalog_items ci
set "price" = s.price
from public.services s
where ci."serviceId" = s.id
  and ci."price" is null;

-- 3. Recién con todo relleno se exigen. El nombre es obligatorio: un diseño
--    sin nombre es justamente el problema que se está corrigiendo.
alter table public.catalog_items
  alter column "name" set not null;

alter table public.catalog_items
  alter column "price" set not null;

alter table public.catalog_items
  alter column "price" set default 0;

-- 4. El precio no puede ser negativo (mismo criterio que en `services`).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'catalog_items_price_check'
  ) then
    alter table public.catalog_items
      add constraint catalog_items_price_check check ("price" >= 0);
  end if;
end $$;

-- 5. Dos diseños del mismo servicio no pueden llamarse igual. Entre servicios
--    distintos sí se repiten a propósito: "French" existe en Esmaltado y en
--    Acrílicas, y son diseños distintos.
create unique index if not exists uq_catalog_items_servicio_nombre
  on public.catalog_items ("serviceId", lower("name"));
