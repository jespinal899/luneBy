# Luné by Kelin — Backend

> **Código de Verificación:** `LEARN-CAP-F997E70D`
> **Repositorio:** https://github.com/jespinal899/luneBy (carpeta `backend/`)

API REST para **Luné by Kelin**, un estudio profesional de manicura: catálogo de
servicios, cálculo de disponibilidad y agendado de citas por franjas horarias.

Este backend se construye de forma incremental, un commit por cambio.

## Endpoints

| Método | Ruta | Acceso |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/auth/check-status` | Autenticado |
| `GET` | `/api/services` | Público (query: `page`, `limit`, `q`, `categorias`, `price`, `minPrice`, `maxPrice`) |
| `GET` | `/api/services/:idOslug` | Público |
| `POST` `PATCH` `DELETE` | `/api/services[/:id]` | Admin |
| `GET` | `/api/appointments/availability?date=&serviceId=` | Público |
| `POST` | `/api/appointments` | Autenticado |
| `GET` | `/api/appointments/me` | Autenticado |
| `PATCH` | `/api/appointments/:id/cancel` | Autenticado (dueño) |
| `GET` | `/api/appointments?date=&status=` | Admin |
| `PATCH` | `/api/appointments/:id/status` | Admin |
| `GET` | `/api/seed` | Público (bloqueado si `STAGE=prod`) |

Detalle interactivo en `/api/docs`.

---

## Stack

| Capa | Tecnología |
| :--- | :--- |
| Runtime | Node.js ≥ 20 |
| Framework | NestJS 10 |
| ORM | TypeORM 0.3 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (Passport) + bcrypt |
| Validación | class-validator / class-transformer |
| Tests | Jest + Supertest |
| CI | GitHub Actions |

---

## Arquitectura

Módulos por dominio, cada uno con su entidad, DTOs, servicio y controlador:

```
src/
├── main.ts                 # bootstrap, prefijo /api, ValidationPipe global
├── app.module.ts           # ConfigModule + TypeOrmModule + módulos de dominio
├── common/                 # PaginationDto y utilidades compartidas
├── auth/                   # usuarios, registro/login, JWT, roles
├── services/               # catálogo de servicios de manicura
├── appointments/           # reglas de disponibilidad, bloqueos y citas
└── seed/                   # carga de datos de ejemplo (solo fuera de prod)
```

---

## Modelo de datos

El esquema lo genera TypeORM a partir de las entidades (`synchronize` en `dev`;
migraciones en `prod`).

```mermaid
erDiagram
    users ||--o{ appointments : "tiene"
    services ||--o{ appointments : "se agenda en"

    users {
        uuid id PK "uuid_generate_v4()"
        text email UK
        text password "select:false (hash bcrypt)"
        text fullName
        text phone "nullable"
        boolean isActive "default true"
        text_array roles "default {client}"
    }

    services {
        uuid id PK
        text name UK
        float price "default 0"
        text description "nullable"
        text category
        int durationMin "default 60"
        text image "nullable (URL)"
        text slug UK
        boolean isActive "default true"
    }

    appointments {
        uuid id PK
        uuid userId FK
        uuid serviceId FK
        date date
        text startTime "HH:mm"
        text endTime "HH:mm (calculado)"
        text status "pending|confirmed|cancelled|done"
        text notes "nullable"
        timestamptz createdAt "default now()"
    }

    availability_rules {
        uuid id PK
        int weekday "0=domingo .. 6=sabado"
        text startTime "HH:mm"
        text endTime "HH:mm"
        int slotIntervalMin "default 30"
        boolean isActive "default true"
    }

    time_off {
        uuid id PK
        date date
        text startTime "nullable (null = dia completo)"
        text endTime "nullable"
        text reason "nullable"
    }
```

| Relación | Cardinalidad | Clave |
| :--- | :--- | :--- |
| `users` → `appointments` | 1 : N | `appointments.userId` |
| `services` → `appointments` | 1 : N | `appointments.serviceId` |
| `availability_rules`, `time_off` | *sin FK* | parámetros del calendario; los lee el cálculo de disponibilidad |

Índices: `UNIQUE` en `users.email`, `services.name`, `services.slug`; índice
compuesto `(date, startTime)` en `appointments`.

---

## Puesta en marcha (desarrollo)

Requisitos: Node.js ≥ 20, Docker.

```bash
cd backend
# Crea el archivo .env con las variables de la tabla de abajo
npm install
docker compose up -d          # PostgreSQL local en el puerto 5432
npm run start:dev             # API en http://localhost:3001/api
```

- API: `http://localhost:3001/api`
- Documentación OpenAPI (Swagger): `http://localhost:3001/api/docs`
- Datos de ejemplo: `GET http://localhost:3001/api/seed`
  (admin `kelin@luneby.com` / clienta `cliente@test.com`, ambos `Abc123`)

> El repositorio **no versiona ningún archivo `.env`** (ni plantillas). Crea tu
> propio `.env` a partir de la tabla siguiente.

### Variables de entorno

| Variable | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `STAGE` | `dev` | `dev` o `prod`. En `prod` se activa SSL y se desactiva `synchronize`. |
| `PORT` | `3001` | Puerto HTTP de la API. |
| `FRONTEND_URL` | `http://localhost:5173` | Origen(es) permitido(s) por CORS, separados por coma. |
| `DB_HOST` | `localhost` | Host de PostgreSQL. |
| `DB_PORT` | `5432` | Puerto de PostgreSQL. |
| `DB_NAME` | `LuneByDB` | Nombre de la base de datos. |
| `DB_USERNAME` | `postgres` | Usuario de PostgreSQL. |
| `DB_PASSWORD` | *(elige uno local)* | Contraseña de PostgreSQL. |
| `JWT_SECRET` | *(cadena larga aleatoria)* | Firma de los JSON Web Tokens. |
| `JWT_EXPIRES_IN` | `2h` | Caducidad de los tokens. |

Genera un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Scripts

| Comando | Descripción |
| :--- | :--- |
| `npm run start:dev` | Servidor en watch mode. |
| `npm run build` | Compila a `dist/`. |
| `npm run start:prod` | Ejecuta `dist/main`. |
| `npm test` | Tests unitarios (Jest). |
| `npm run test:cov` | Tests con cobertura. |
| `npm run test:e2e` | Tests end-to-end. |
| `npm run lint` | ESLint + Prettier. |

---

## Tests

- Unitarios: `src/**/*.spec.ts`
- End-to-end: `test/**/*.e2e-spec.ts`

```bash
npm test
```

La integración continua (`.github/workflows/backend-ci.yml`) compila y ejecuta los
tests en cada push o pull request que toque `backend/`.

---

## Producción

- Poner `STAGE=prod`: activa SSL en la conexión a PostgreSQL, desactiva
  `synchronize` (el esquema pasa a gestionarse con migraciones) y bloquea
  `GET /api/seed`.
- `FRONTEND_URL` debe apuntar al dominio real del frontend.
- `JWT_SECRET` distinto y de alta entropía.
- Base de datos gestionada (p. ej. Supabase): rellenar `DB_*` con sus credenciales.

## Hoja de ruta

- [x] Scaffold NestJS
- [x] Conexión a PostgreSQL (TypeORM)
- [x] Módulo common (paginación)
- [x] Auth (registro / login / JWT + roles)
  - [x] Entidad `User` y roles
  - [x] DTOs e interfaces
  - [x] Estrategia JWT y Passport
  - [x] Endpoints de registro y login
  - [x] Protección de rutas por roles (`@Auth`, `@GetUser`, `UserRoleGuard`)
- [x] Services (catálogo con filtros de categoría y precio + CRUD admin)
- [x] Appointments (disponibilidad + agendado por slots + gestión admin)
- [x] Seed de datos (`GET /api/seed`, bloqueado en producción)
- [x] Documentación OpenAPI (`/api/docs`) y CORS por entorno
- [ ] Migraciones y despliegue (Supabase)
- [ ] Subida de imágenes de servicios
