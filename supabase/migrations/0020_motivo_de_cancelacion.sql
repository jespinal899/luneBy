-- 0020 · Por qué se canceló la cita
--
-- Cancelar dejaba la cita en `cancelled` y nada más: Kelin veía el hueco en
-- la agenda sin saber si la clienta se enfermó, si encontró otra fecha o si
-- hubo un problema con el servicio. Esa diferencia importa para decidir si
-- conviene ofrecerle otro horario.
--
-- Es nullable a propósito: el motivo es opcional. Obligar a justificarse en
-- el momento en que alguien ya decidió irse suele producir fricción o texto
-- de relleno, que no informa más que el silencio. Las citas ya canceladas
-- antes de esta migración quedan en NULL, que es la verdad: no se preguntó.

alter table public.appointments
  add column if not exists "cancellationReason" text;

comment on column public.appointments."cancellationReason" is
  'Motivo que escribió la clienta al cancelar. NULL si no dijo nada o si la canceló la administradora.';
