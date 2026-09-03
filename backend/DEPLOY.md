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
   Detecta `backend/render.yaml`.
2. Render pedirá los valores marcados como *sync: false*. Rellena:
   - `FRONTEND_URL` → la URL de Vercel (ej. `https://luneby.vercel.app`)
   - `HOST_API` → `https://luneby-api.onrender.com/api`
   - `DATABASE_URL` → la URI del *Session pooler* de Supabase (paso 1)
   - `JWT_SECRET` lo genera Render automáticamente.
3. Deploy. En el primer arranque se aplican las migraciones sobre Supabase.

### Opción B — Servicio manual

- **New + → Web Service** → este repo → *Root Directory* `backend`,
  *Runtime* `Docker`.
- Añade las mismas variables de entorno en **Environment**.

### Poblar datos de ejemplo (una vez)

```bash
curl https://luneby-api.onrender.com/api/seed
```

> `GET /api/seed` está **bloqueado si `STAGE=prod`**. Para usarlo una vez en
> Render: pon temporalmente `STAGE=dev`, llama al endpoint y vuelve a `prod`.
> O carga los datos con un script/SQL propio.

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
