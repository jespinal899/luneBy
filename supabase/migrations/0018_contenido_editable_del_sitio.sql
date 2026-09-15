-- 0018 · La portada deja de estar escrita en el código
--
-- El título, el subtítulo y la foto de la portada vivían en HomePage.tsx, y
-- la foto además era un import que Vite empaquetaba al compilar. Cambiar una
-- coma exigía un desarrollador y un despliegue.
--
-- Esta tabla guarda bloques de contenido como clave/valor. Es clave/valor y
-- no una columna por campo a propósito: el día que se quiera editar también
-- "Nosotros" o los datos de contacto, es una fila nueva y no otra migración.
--
-- No se inserta ninguna fila acá. Mientras no exista, la API responde los
-- valores por defecto (DEFAULT_HERO), que son exactamente el texto con el que
-- la portada ya está publicada: estrenar esto no cambia nada de lo que se ve.
--
-- Idempotente: se aplica igual en CI sobre una base nueva y en producción.

create table if not exists public.site_content (
  "key"       text primary key,
  "value"     jsonb not null,
  "updatedAt" timestamptz not null default now()
);

-- Solo el backend escribe acá, con su rol de servicio. Los visitantes leen la
-- portada por la API pública, nunca directo contra la tabla.
alter table public.site_content enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'site_content'
      and policyname = 'site_content_lectura_publica'
  ) then
    create policy site_content_lectura_publica
      on public.site_content
      for select
      using (true);
  end if;
end $$;
