-- 0017 · La cita recuerda qué diseño se reservó
--
-- Desde 0016 un diseño tiene nombre y precio propios ("Soft Glam", L. 450),
-- distintos a los de su servicio ("Esmaltado", L. 350). Pero al agendar solo
-- viajaban los `serviceIds`, así que la cita congelaba el nombre y el precio
-- del SERVICIO: se cotizaba una cosa y se agendaba otra.
--
-- Esta columna deja constancia de qué diseño concreto eligió la clienta.
-- El nombre y el precio se siguen congelando en `nameAtBooking` /
-- `priceAtBooking` como hasta ahora — solo cambia de dónde salen.
--
-- Es nullable a propósito: se puede reservar un servicio sin elegir diseño
-- (desde /shop/agendar), y las citas anteriores a este cambio no tienen uno.
--
-- ON DELETE SET NULL, igual que `serviceId`: si Kelin borra un diseño del
-- catálogo, las citas que lo usaron NO se borran ni pierden su información.
-- Siguen mostrando el nombre y el precio congelados, que es justamente para
-- lo que existen esas columnas.

alter table public.appointment_items
  add column if not exists "catalogItemId" uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointment_items_catalogItemId_fkey'
  ) then
    alter table public.appointment_items
      add constraint "appointment_items_catalogItemId_fkey"
      foreign key ("catalogItemId")
      references public.catalog_items(id)
      on delete set null;
  end if;
end $$;

-- Para responder "¿cuántas veces se reservó este diseño?" sin recorrer todo.
create index if not exists idx_appointment_items_catalog_item
  on public.appointment_items ("catalogItemId");
