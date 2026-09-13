-- ci-simulate-supabase-roles.sql
--
-- Simula, en un Postgres vainilla (CI, o cualquier verificación local), las
-- piezas de la plataforma Supabase de las que dependen las policies de RLS
-- en supabase/migrations/0010_rls_policies.sql y 0015_rls_catalogo.sql:
--   - los roles `anon` y `authenticated`
--   - el esquema `auth` y la función `auth.uid()`
--
-- Por qué existe este archivo aparte (y no vive dentro de supabase/migrations):
-- ese directorio se aplica TAL CUAL contra producción (Supabase real), donde
-- esos roles y esa función ya existen y los administra la plataforma. Crear
-- o tocar roles ahí sería mezclar "cómo se ve el entorno de Supabase" con una
-- migración de negocio que también corre en prod. Este script solo se corre
-- en el Postgres descartable de CI/verificación, ANTES de aplicar las
-- migraciones reales — nunca contra producción.
--
-- Idempotente: seguro de correr más de una vez contra el mismo Postgres.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

create schema if not exists auth;

create or replace function auth.uid() returns uuid
  language sql stable
  as $$ select null::uuid $$;
-- Nota: en Supabase real, auth.uid() lee el JWT de la sesión de PostgREST.
-- Acá siempre devuelve NULL porque esta app no usa Supabase Auth (ver
-- ADR-002) — el propósito de este script es únicamente permitir que las
-- policies SE CREEN en CI, no simular una sesión autenticada real.
