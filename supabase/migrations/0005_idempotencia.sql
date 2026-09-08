-- 0005 · Idempotencia de la API
--
-- Cuando una operación de escritura llega con la cabecera `Idempotency-Key`,
-- la API guarda aquí su resultado. Un reintento con la misma key (doble clic,
-- corte de red, reintento de un proxy) devuelve la respuesta guardada sin
-- volver a ejecutar la operación.
--
-- Idempotente: `create ... if not exists`.

create table if not exists public.idempotency_keys (
  key           text        not null,
  "userId"      uuid,
  method        text        not null,
  path          text        not null,
  "statusCode"  integer,
  response      jsonb,
  "completedAt" timestamptz,
  "createdAt"   timestamptz not null default now(),
  constraint pk_idempotency_keys primary key (key)
);

-- Para poder purgar las keys viejas de forma barata.
create index if not exists idx_idempotency_keys_created
  on public.idempotency_keys ("createdAt");
