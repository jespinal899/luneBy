-- 0012 · Separar "catálogo" de "servicios agendables"
--
-- Hasta ahora `isActive` controlaba dos cosas a la vez: que el servicio
-- se viera en el catálogo público (referencia de diseños) y que se pudiera
-- agendar. Se separan: `isActive` sigue siendo "visible en el catálogo";
-- `isBookable` decide si aparece como opción en /shop/agendar.
--
-- Por defecto todo lo activo sigue siendo agendable (no cambia el
-- comportamiento actual hasta que el admin lo ajuste desde el nuevo módulo).

alter table public.services
  add column if not exists "isBookable" boolean not null default true;
