-- 0019 · Recuperación de contraseña por código enviado al correo
--
-- Quien olvida su contraseña pide un código de 6 dígitos, lo escribe y elige
-- una nueva. Esta tabla guarda los códigos pedidos.
--
-- El código NO se guarda en claro: se guarda su hash con bcrypt, igual que
-- una contraseña. Un código de correo vale tanto como la cuenta —permite
-- entrar sin saber la contraseña—, así que si alguien llegara a leer la base
-- no debe poder usar ninguno.
--
-- Caduca (`expiresAt`), es de un solo uso (`usedAt`) y lleva la cuenta de los
-- intentos fallidos: seis dígitos son un millón de combinaciones, que un
-- script prueba en minutos si se lo deja intentar sin límite.
--
-- ON DELETE CASCADE: si se borra la cuenta, sus códigos no tienen sentido.
--
-- Idempotente: se aplica igual en CI sobre una base nueva y en producción.

create table if not exists public.password_resets (
  id          uuid primary key default gen_random_uuid(),
  "userId"    uuid not null references public.users(id) on delete cascade,
  "codeHash"  text not null,
  "expiresAt" timestamptz not null,
  "attempts"  int not null default 0,
  "verifiedAt" timestamptz,
  "usedAt"    timestamptz,
  "createdAt" timestamptz not null default now()
);x|

-- Al pedir un código se buscan los vigentes de esa cuenta para invalidarlos.
create index if not exists idx_password_resets_user
  on public.password_resets ("userId");

-- Solo el backend toca esta tabla, con su rol de servicio. Ningún visitante
-- debe poder leerla: ver los hashes no da la cuenta, pero sí revela qué
-- correos pidieron recuperación y cuándo.
alter table public.password_resets enable row level security;
