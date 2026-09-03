# Luné by Kelin — Frontend

Aplicación web (React 19 + Vite + TypeScript) para el estudio de manicura
**Luné by Kelin**: catálogo de servicios, agendado de citas y panel de
administración. Consume la API del backend (carpeta `../backend`).

## Stack

| Área | Tecnología |
| :--- | :--- |
| Framework | React 19 + Vite |
| Router | react-router (data router) |
| Estado servidor | TanStack Query (`@tanstack/react-query`) |
| HTTP | axios (`src/api/http.ts`) |
| Estilos | Tailwind CSS v4 + `@base-ui/react` |
| Lint | oxlint |

## Puesta en marcha

Requisitos: Node.js ≥ 20 y el backend corriendo.

```bash
# 1. Backend + base de datos (en ../backend)
docker start lunebydb           # o: docker compose up -d
cd ../backend && npm run start:dev   # API en http://localhost:3001/api

# 2. Frontend
cd frontend
npm install
# crea .env con la URL de la API (ver abajo)
npm run dev                     # http://localhost:5173
```

Para tener datos: `GET http://localhost:3001/api/seed`
(admin `kelin@luneby.com` / clienta `cliente@test.com`, ambos `Abc123`).

### Variables de entorno

El repositorio **no versiona ningún `.env`**. Crea `frontend/.env`:

| Variable | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3001/api` | URL base de la API. Si se omite se usa ese mismo valor por defecto. |

En producción (Vercel) se configura `VITE_API_URL` con la URL pública del backend.

## Estructura

```
src/
├── api/           # http.ts (axios), query-client.ts, types.ts, errors.ts
├── auth/          # AuthContext, login/registro, ProtectedRoute
├── shop/          # catálogo, detalle, agendar, mis citas + hooks/api
├── admin/         # panel: servicios y agenda de citas + hooks/api
├── components/ui/ # componentes base
└── app.router.tsx # rutas
```

## Scripts

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | `tsc -b` + build de producción. |
| `npm run preview` | Sirve el build. |
| `npm run lint` | oxlint. |
