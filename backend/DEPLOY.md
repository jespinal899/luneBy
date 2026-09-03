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

3. No hace falta crear tablas: al arrancar, la API aplica las migraciones
   (`migrationsRun`). La extensión `uuid-ossp` ya viene habilitada en Supabase.

### Correr las migraciones a mano (opcional)

```bash
DATABASE_URL="postgresql://postgres.<ref>:...@aws-0-<region>.pooler.supabase.com:5432/postgres" \
  npm run migration:run
```

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
3. **Apply**. En el primer arranque se aplican las migraciones sobre Supabase
   (ya están aplicadas si corriste `migration:run` antes; es idempotente).

### Opción B — Servicio manual

- **New + → Web Service** → este repo → *Root Directory* `backend`,
  *Runtime* `Docker`, *Health Check Path* `/api/services`.
- Añade las mismas variables de entorno en **Environment**.

### Poblar datos de ejemplo (una vez)

`GET /api/seed` está **bloqueado en producción**. Usa el comando:

```bash
# en local, apuntando a Supabase con DATABASE_URL en .env
npm run build && npm run seed
```

o en Render: **Shell** del servicio → `npm run seed`.

---

## 3. Frontend (Vercel)

- *Root Directory*: `frontend`
- Variable de entorno: `VITE_API_URL = https://luneby-api.onrender.com/api`
- Tras desplegar, actualiza `FRONTEND_URL` en Render con la URL final de Vercel.

---

## Migraciones

El esquema se versiona en `src/migrations/`. Flujo al cambiar una entidad:

```bash
# con la base de datos local al día
npm run migration:generate -- src/migrations/DescripcionDelCambio
npx prettier --write "src/migrations/*.ts"
npm run build
# al reiniciar la API (local o Render) la migración se aplica sola
```

- `npm run migration:run` — aplica pendientes manualmente
- `npm run migration:revert` — deshace la última
