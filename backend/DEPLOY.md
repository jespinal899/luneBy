# Despliegue — Luné by Kelin (backend)

Base de datos en **Supabase** (PostgreSQL) · API en **Render** (Docker) ·
frontend en **Vercel**.

---

## 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com). Apunta la
   **Database password** que eliges al crearlo.
2. En **Project Settings → Database → Connection string** elige **"Session
   pooler"** en el desplegable y copia la URI. Tiene esta forma:

   ```
   postgresql://postgres.<ref>:[PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

   Esa URI completa es la variable **`DATABASE_URL`**.

   > La "Direct connection" (`db.<ref>.supabase.co`) es **IPv6-only** en los
   > proyectos nuevos de Supabase; muchas redes no la resuelven. El *Session
   > pooler* funciona por IPv4 y soporta migraciones.

3. Aplica el esquema y los datos base con la **CLI de Supabase**:

   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref <ref>
   supabase db push          # aplica supabase/migrations/*.sql
   ```

   Los scripts son idempotentes: `db push` es seguro aunque la base ya tenga
   el esquema. Crea los 2 usuarios de ejemplo, el catálogo y el horario.
   Detalle en [`../supabase/README.md`](../supabase/README.md).

---

## 2. API (Render)

### Opción A — Blueprint (recomendado)

1. En Render: **New + → Blueprint** y selecciona este repositorio.
   Detecta `render.yaml` en la raíz (define el servicio `luneby-api` con
   `rootDir: backend`).
2. Render pedirá los valores marcados como *sync: false*. Rellena:
   - `DATABASE_URL` → la URI del *Session pooler* de Supabase (paso 1)
   - `FRONTEND_URL` → la URL de Vercel (ej. `https://luneby.vercel.app`)
   - `HOST_API` → `https://luneby-api.onrender.com/api`
   - `SUPABASE_URL` → `https://<ref>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` → *Project Settings → API → `service_role`*
   - `JWT_SECRET` lo genera Render automáticamente.

   Con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` las imágenes de servicios se
   suben a Supabase Storage (bucket público `service-images`, creado solo); sin
   ellas, se guardan en el disco de Render (efímero).
3. **Apply**. La API solo se conecta a la base; no crea tablas ni datos. El
   esquema y los datos base los pusiste con `supabase db push` (paso 1.3).

### Opción B — Servicio manual

- **New + → Web Service** → este repo → *Root Directory* `backend`,
  *Runtime* `Docker`, *Health Check Path* `/api/health`.
- Añade las mismas variables de entorno en **Environment**.

---

## 3. Frontend (Vercel)

- *Root Directory*: `frontend`
- Variable de entorno: `VITE_API_URL = https://luneby-api.onrender.com/api`
- Tras desplegar, actualiza `FRONTEND_URL` en Render con la URL final de Vercel.

---

## Migraciones

El esquema y los datos base se versionan como SQL en `supabase/migrations/`
(raíz del repo). Flujo al cambiar el esquema:

```bash
supabase migration new descripcion_del_cambio   # crea supabase/migrations/NNNN_*.sql
# edita el .sql — SQL idempotente (if not exists, on conflict, where not exists)
supabase db push                                 # aplica las pendientes en la nube
```

`supabase db push` solo ejecuta los archivos que aún no están registrados en
`supabase_migrations.schema_migrations`. Guía completa en
[`../supabase/README.md`](../supabase/README.md).
