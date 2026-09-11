# Exports de la base de datos

Generados con `supabase db dump` contra el proyecto en la nube (`fxlttpayjkkbfomveavx`).

- `schema_2026-09-11.sql` — esquema completo del schema `public` (tablas, PKs,
  FKs, índices, `CHECK`, la exclusión de solapamiento de citas, y las
  políticas RLS de la migración `0010_rls_policies.sql`).
- `data_2026-09-11.sql` — datos reales de `services`, `availability_rules`,
  `appointments` y `appointment_items`.

## Por qué `users` e `idempotency_keys` no están en `data_*.sql`

Se excluyeron a propósito (`supabase db dump --data-only -x public.users -x
public.idempotency_keys`) porque contienen datos sensibles reales:

- **`users`** — hash bcrypt vigente de la contraseña del admin.
- **`idempotency_keys`** — guarda el cuerpo completo de respuestas pasadas de
  la API, incluyendo JWT de sesión y datos personales (email, teléfono,
  avatar) de usuarios reales.

Ambas tablas sí están documentadas en `schema_2026-09-11.sql` (estructura,
sin filas) y tienen RLS habilitado en el esquema real.

Para regenerar:

```bash
supabase db dump --linked -s public -f supabase/exports/schema_$(date +%F).sql
supabase db dump --linked --data-only -s public \
  -x public.users -x public.idempotency_keys \
  -f supabase/exports/data_$(date +%F).sql
```
