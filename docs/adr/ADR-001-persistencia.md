# ADR-001 — Persistencia de datos: Postgres gestionado (Supabase) + migraciones SQL versionadas

- **Estado:** Aceptada
- **Fecha:** 2026-09-01

## Contexto

El proyecto necesita una base de datos relacional para el catálogo de
servicios, las citas y sus reglas de integridad (una cita no puede solapar
con otra en el mismo horario, un servicio con citas asociadas no se puede
borrar, etc.). Se evaluaron tres caminos:

1. **Postgres autoadministrado** (contenedor propio en el mismo servidor
   que la API, o en una VM). Control total, pero el equipo (una sola
   persona, sin rol de DevOps dedicado) tendría que ocuparse de backups,
   parches de seguridad y alta disponibilidad.
2. **Una base NoSQL gestionada** (ej. Firestore/MongoDB Atlas). Reduce la
   carga operativa, pero el dominio es fuertemente relacional: una cita
   referencia un servicio y un usuario, y necesitamos invariantes como "no
   dos citas activas se solapan en el mismo rango horario", que en Postgres
   se expresan de forma nativa con un `EXCLUDE` constraint y en un modelo de
   documentos hay que reconstruir a mano en la capa de aplicación.
3. **Postgres gestionado por Supabase**, con TypeORM en el backend hablando
   directo con la base (no a través de la capa REST de Supabase) y el
   esquema versionado como SQL plano.

El equipo de desarrollo son 1-2 personas sin presupuesto para administrar
infraestructura de base de datos, y el dominio (citas, solapamiento de
horarios, catálogo con relaciones) encaja naturalmente en el modelo
relacional.

## Decisión

Se usa **Postgres gestionado por Supabase** como única base de datos,
accedida desde el backend NestJS vía **TypeORM**, con estas reglas:

- **El esquema se versiona como SQL plano** en `supabase/migrations/`
  (actualmente 15 archivos), no con `synchronize: true` de TypeORM ni con
  las migraciones autogeneradas de TypeORM. Cada archivo es idempotente
  (`create table if not exists`, `alter table ... add column if not
  exists`, bloques `do $$ ... $$` que comprueban `pg_constraint` antes de
  agregar una restricción) para poder aplicarse sin romper tanto en un
  Postgres recién creado (CI) como en el de producción con datos reales.
- **Las invariantes de negocio críticas viven en la base, no solo en la
  aplicación.** El caso más claro: `no_overlap_citas` es un `EXCLUDE
  USING gist` sobre el rango de tiempo de cada cita — si dos requests
  concurrentes intentan reservar el mismo horario, Postgres rechaza la
  segunda con un error de constraint (código `23P01`), que la API traduce
  a un 409 legible. Confiar esto solo a una validación en memoria en
  Node dejaría una ventana de condición de carrera.
- **La conexión de la API usa el *connection pooler* de Supabase**
  (`DATABASE_URL`), no la conexión directa, porque el plan gratuito de
  Supabase resuelve la conexión directa solo por IPv6, y Render (donde
  corre la API) no la resuelve de forma confiable.
- **RLS (Row Level Security)** se habilita en las tablas expuestas por la
  API REST propia de Supabase (PostgREST) — es una capa adicional, no la
  que protege el panel de administración (eso lo hacen los guards de
  NestJS, porque la API se conecta como propietaria de las tablas y a un
  propietario RLS no lo filtra).

## Consecuencias

**Positivas**

- Cero trabajo operativo de base de datos (backups, parches, alta
  disponibilidad los resuelve Supabase).
- El esquema es legible y auditable en el propio control de versiones:
  cualquier cambio de estructura pasa por revisión de código como el resto
  del proyecto, no vive solo en el historial de migraciones generado por un
  ORM.
- Las invariantes de integridad (solapamiento de citas, claves foráneas,
  `CHECK` de estados válidos) se cumplen aunque el bug esté en la capa de
  aplicación — es una segunda línea de defensa real, no documentación.
- El mismo conjunto de migraciones se aplica igual en CI (Postgres vainilla
  en un contenedor descartable) y en producción, así que un cambio de
  esquema que rompe algo se detecta antes del deploy.

**Negativas / costos aceptados**

- Dependencia de un proveedor externo (Supabase) para la disponibilidad de
  la base; una caída de Supabase es una caída del negocio completo.
- Escribir SQL a mano (en vez de dejar que el ORM genere las migraciones)
  es más lento por cambio y exige más cuidado para mantener la
  idempotencia.
- Las políticas RLS y las políticas de NestJS son dos mecanismos de
  autorización distintos que hay que razonar por separado — hay que
  documentar explícitamente cuál protege qué puerta para no asumir una
  cobertura que no existe (ver `supabase/migrations/0015_rls_catalogo.sql`,
  que deja constancia de que las policies de `appointment_items` hoy no
  filtran nada porque la app no usa Supabase Auth — ver ADR-002).
