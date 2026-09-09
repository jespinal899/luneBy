-- 0009 · Inicio de sesión con Google
--
-- Los usuarios que entran con Google no tienen contraseña local. Se guarda el
-- `googleId` (el `sub` del ID token) para reconocerlos en visitas siguientes.

alter table public.users alter column password drop not null;

alter table public.users add column if not exists "googleId" text;
alter table public.users
  drop constraint if exists uq_users_google_id;
alter table public.users
  add constraint uq_users_google_id unique ("googleId");

alter table public.users add column if not exists "avatarUrl" text;
