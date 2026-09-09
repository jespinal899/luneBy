# 💅 Luné by Kelin - Plataforma de Servicios y Citas de Manicura

> **Código de Verificación:** `LEARN-CAP-F997E70D`  
> **Repositorio de GitHub:** [https://github.com/jespinal899/luneBy](https://github.com/jespinal899/luneBy)

---

## 🌟 Descripción del Proyecto
**Luné by Kelin** es una aplicación web moderna y premium diseñada para un estudio profesional de manicura, aplicación de uñas esculpidas, nail art de tendencia y cuidado de manos. Permite a las clientes navegar por el catálogo interactivo de servicios, filtrar según categorías (acrílico, gel, esmaltado, pedicura), realizar cotizaciones estimadas en tiempo real y agendar citas de forma ágil.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologías Utilizadas |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, TypeScript, React Router v8, TanStack Query, axios |
| **Estilos & UI** | Tailwind CSS v4, Base UI, Lucide Icons, Montserrat & Inter Fonts |
| **Backend** | NestJS 10, TypeORM, PostgreSQL, JWT (carpeta `backend/` — ver su [README](backend/README.md)) |

---

## 📁 Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

```text
ProyectoCitas/
├── frontend/                # Aplicación cliente (React + Vite)
│   ├── src/
│   │   ├── api/             # cliente axios, QueryClient, tipos de la API
│   │   ├── auth/            # contexto de sesión, login/registro, rutas protegidas
│   │   ├── shop/            # catálogo, detalle, agendar cita, mis citas
│   │   ├── admin/           # panel: servicios y agenda de citas
│   │   └── components/ui/   # componentes base
│   └── README.md            # puesta en marcha y variables de entorno
├── backend/                 # API REST (NestJS + TypeORM + PostgreSQL)
│   ├── src/
│   │   ├── common/          # DTO de paginación y utilidades compartidas
│   │   ├── auth/            # usuarios, registro/login, JWT y roles
│   │   ├── services/        # catálogo de servicios de manicura
│   │   └── appointments/    # disponibilidad y agendado de citas
│   └── test/                # tests end-to-end
└── supabase/                # esquema y datos base (migraciones SQL)
    └── migrations/          # 0001_esquema_inicial.sql, 0002_datos_demo.sql
```

---

## 🚀 Características Clave

* **Catálogo Interactivo de Servicios:** Grid dinámico que muestra servicios populares de manicura, pedicura, acrílico y nail art.
* **Filtros Avanzados (FilterSidebar):** Búsqueda interactiva por categorías y rangos de precio.
* **Paginación Personalizada (CustomPagination):** Paginación responsiva que optimiza la navegación y se sincroniza con los parámetros de la URL (`?page=`).
* **Header & Footer Personalizados:** Componentes de navegación consistentes con diseño adaptado a móviles y pantallas de escritorio.
* **Alineación de Marca:** Diseño minimalista y moderno inspirado en interfaces de alta gama.

---

## ⚙️ Instalación y Ejecución

### Requisitos previos
* **Node.js 20 LTS** y **npm** (para el flujo con npm).
* **Docker** y **Docker Compose** (para el flujo con contenedores).
* **Git**.

### 1. Clonar el repositorio
```bash
git clone https://github.com/jespinal899/luneBy.git
cd luneBy
```

### 2. Variables de entorno
Cada app trae una plantilla `.env.example`. Cópiala a `.env` y ajusta los valores
(los `.env` reales están en `.gitignore` y **nunca** se versionan):

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

| App        | Variable            | Para qué |
| ---------- | ------------------- | -------- |
| backend    | `STAGE`             | `dev` local · `prod` en servidor (activa SSL de Postgres) |
| backend    | `PORT`              | Puerto de la API (por defecto `3001`) |
| backend    | `FRONTEND_URL`      | Origen(es) permitido(s) por CORS (coma-separados) |
| backend    | `DB_*`              | Conexión a Postgres local |
| backend    | `DATABASE_URL`      | Alternativa a `DB_*`: connection string (Supabase / Postgres gestionado). Tiene prioridad |
| backend    | `JWT_SECRET`        | Secreto para firmar los JWT — `openssl rand -base64 48` |
| backend    | `JWT_EXPIRES_IN`    | Vigencia del token (ej. `2h`) |
| backend    | `SUPABASE_*`        | *(opcional)* subir imágenes a Supabase Storage en vez de disco local |
| frontend   | `VITE_API_URL`      | URL base de la API, con el sufijo `/api` |

### 3a. Ejecutar con Docker (stack completo)
Levanta base de datos + API + frontend en contenedores aislados:

```bash
docker compose up --build
```

* Frontend → <http://localhost:8080>
* API      → <http://localhost:3001/api>
* Swagger  → <http://localhost:3001/api/docs>
* Postgres → `localhost:5432`

El esquema y los datos base se aplican con las migraciones de `supabase/migrations`
(ver [`supabase/README.md`](supabase/README.md)).

### 3b. Ejecutar con npm (desarrollo)
En dos terminales:

```bash
# API
cd backend && npm ci && npm run start:dev      # http://localhost:3001/api

# Frontend
cd frontend && npm ci && npm run dev            # http://localhost:5173
```

Para la base de datos en local sin el stack completo:
```bash
docker compose up db
```

### 4. Scripts útiles

| Acción            | Backend (`cd backend`) | Frontend (`cd frontend`) |
| ----------------- | ---------------------- | ------------------------ |
| Lint              | `npm run lint:ci`      | `npm run lint`           |
| Verificar tipos   | `npm run typecheck`    | `npm run typecheck`      |
| Tests unitarios   | `npm test`             | `npm run test:run`       |
| Cobertura         | `npm run test:cov`     | `npm run test:cov`       |
| Build producción  | `npm run build`        | `npm run build`          |

### 5. Imágenes Docker por separado
```bash
docker build -t luneby-api ./backend
docker build -t luneby-web --build-arg VITE_API_URL=https://tu-api/api ./frontend
```

---

## 🔄 CI/CD (GitHub Actions)

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) se ejecuta en cada
`push` y `pull_request` a `main` y `develop`:

1. **`changes`** — `dorny/paths-filter` detecta si cambió `backend/**` y/o
   `frontend/**` (o el propio workflow).
2. **`backend`** y **`frontend`** — se ejecutan en paralelo, y solo el que
   corresponda según el paso anterior. Cada uno: checkout → Node.js 20 LTS con
   caché de `npm` → `npm ci` → lint (ESLint / oxlint) → `tsc --noEmit` → tests
   (Jest / Vitest) → build de producción.
3. **`ci-ok`** — job final que pasa si ningún job falló (uno saltado por el
   filtro cuenta como OK). Es el check a exigir en la protección de rama.

El deploy es automático: **Render** reconstruye la API al hacer push a `main`
(`render.yaml`) y **Vercel** publica el frontend. El workflow
[`keep-alive.yml`](.github/workflows/keep-alive.yml) hace ping a la API cada 10 min
para que el plan free de Render no la duerma.

Ver el estado del pipeline en la pestaña **Actions** del repositorio.

---

## 🔒 Buenas prácticas de seguridad
* **Sin secretos versionados**: los `.env` reales están en `.gitignore`; solo se versionan las plantillas `.env.example` (sin valores reales).
* La configuración sensible vive en las variables de entorno del hosting (Render / Vercel / Supabase).
* La imagen Docker de la API corre como usuario sin privilegios (`node`) y con `tini` como PID 1.
