-- 0014 · Separar el catálogo de los servicios agendables
--
-- Antes `services` hacía las dos cosas a la vez (una fila salía en el
-- catálogo Y era agendable, según dos booleanos). Ahora:
--
--   services        -> SOLO los servicios agendables (/admin/agendar).
--                      Conserva el historial: appointments.serviceId sigue
--                      apuntando acá. `isActive` pasa a significar
--                      "disponible para agendar".
--   catalog_items   -> las entradas del catálogo (/admin/products): una
--                      foto + descripción que apuntan a un servicio. El
--                      nombre, precio y duración se heredan del servicio,
--                      por eso no se duplican acá.
--
-- Puede haber varias entradas de catálogo para el mismo servicio (varias
-- fotos de distintos diseños del mismo servicio).

create table if not exists public.catalog_items (
  id            uuid        not null default gen_random_uuid(),
  "serviceId"   uuid        not null,
  image         text,
  description   text,
  "isActive"    boolean     not null default true,
  "createdAt"   timestamptz not null default now(),
  constraint pk_catalog_items primary key (id),
  constraint fk_catalog_items_service
    foreign key ("serviceId") references public.services (id)
    on delete cascade
);

-- Para listar/filtrar el catálogo por su servicio.
create index if not exists idx_catalog_items_service
  on public.catalog_items ("serviceId");

-- `isBookable` ya no tiene sentido: toda la tabla `services` ES lo agendable.
-- Su rol lo cumple ahora `isActive`.
alter table public.services drop column if exists "isBookable";
