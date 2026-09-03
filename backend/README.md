# Luné by Kelin — Backend

> **Código de Verificación:** `LEARN-CAP-F997E70D`
> **Repositorio:** https://github.com/jespinal899/luneBy (carpeta `backend/`)

API REST para **Luné by Kelin**, un estudio profesional de manicura: catálogo de
servicios, cálculo de disponibilidad y agendado de citas por franjas horarias.

Este backend se construye de forma incremental, un commit por cambio. El estado
actual está en la sección [Hoja de ruta](#hoja-de-ruta).

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

## Puesta en marcha (desarrollo)

Requisitos: Node.js ≥ 20, Docker.

```bash
cd backend
# Crea el archivo .env con las variables de la tabla de abajo
npm install
docker compose up -d          # PostgreSQL local en el puerto 5432
npm run start:dev             # API en http://localhost:3001/api
```

> El repositorio **no versiona ningún archivo `.env`** (ni plantillas). Crea tu
> propio `.env` a partir de la tabla siguiente.

### Variables de entorno

| Variable | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `STAGE` | `dev` | `dev` o `prod`. En `prod` se activa SSL y se desactiva `synchronize`. |
| `PORT` | `3001` | Puerto HTTP de la API. |
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
- [ ] Seed de datos
- [ ] Migraciones y despliegue (Supabase)
