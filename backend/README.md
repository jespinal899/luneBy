# Luné by Kelin — Backend

API REST (NestJS + TypeORM + PostgreSQL) para el catálogo de servicios de manicura
y el agendado de citas de Luné by Kelin.

## Desarrollo

```bash
cp .env.template .env
npm install
npm run start:dev   # http://localhost:3001/api
```

## Estado

En construcción, commit a commit:

- [x] Scaffold NestJS
- [ ] Conexión a PostgreSQL (TypeORM)
- [ ] Módulo common (paginación)
- [ ] Auth (registro / login / JWT + roles)
- [ ] Services (catálogo con filtros)
- [ ] Appointments (citas por slots de horario)
- [ ] Seed de datos
