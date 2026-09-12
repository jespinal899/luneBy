-- 0013 · Fecha de creación de los servicios
--
-- Sin esto, el home no tiene forma de mostrar "los más recientes": el
-- orden alfabético (aunque ya sea insensible a mayúsculas) siempre deja
-- afuera de la vista previa lo que caiga último en el abecedario, sin
-- importar si se creó ayer. Con `createdAt` el home puede ordenar por
-- recientes en vez de por nombre.

alter table public.services
  add column if not exists "createdAt" timestamptz not null default now();
