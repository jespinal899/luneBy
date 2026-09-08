-- 0006 · Horario de atención real del salón
--
-- Reemplaza el horario genérico (lun–sáb 09:00–18:00) por el real:
--   Lunes a jueves : 17:30 – 22:00
--   Viernes        : 16:30 – 22:00
--   Sábado y domingo: 13:00 – 22:00
--
-- A partir de aquí el horario se edita desde el panel de administración.

delete from public.availability_rules
where "startTime" = '09:00' and "endTime" = '18:00';

insert into public.availability_rules
  (weekday, "startTime", "endTime", "slotIntervalMin", "isActive")
select h.w, h.s, h.e, 30, true
from (values
  (1, '17:30', '22:00'),
  (2, '17:30', '22:00'),
  (3, '17:30', '22:00'),
  (4, '17:30', '22:00'),
  (5, '16:30', '22:00'),
  (6, '13:00', '22:00'),
  (0, '13:00', '22:00')
) as h(w, s, e)
where not exists (
  select 1 from public.availability_rules ar where ar.weekday = h.w
);
