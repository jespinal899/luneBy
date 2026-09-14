# ADR-002 — Autenticación propia con JWT (no Supabase Auth)

- **Estado:** Aceptada, con una deuda técnica documentada
- **Fecha:** 2026-09-02

## Contexto

El proyecto usa Postgres gestionado por Supabase (ver ADR-001). Supabase
ofrece un servicio de autenticación propio (Supabase Auth) que integra
`auth.users`, emite sus propios JWT y expone `auth.uid()` dentro de
Postgres — pensado justamente para combinarse con RLS.

La alternativa era construir autenticación propia dentro del backend
NestJS: una tabla `users` en el mismo esquema `public`, hash de contraseña
con `bcrypt`, JWT propio firmado con `@nestjs/jwt`, y verificación manual
del `id_token` de Google contra la librería oficial de Google
(`google-auth-library`) para el login social.

Motivos para no adoptar Supabase Auth de entrada:

- El equipo ya tenía roles de negocio (`admin` / `client`) y reglas propias
  (una cuenta puede no tener contraseña si solo inició sesión con Google,
  hay que poder desactivar una cuenta) que de todas formas requerían una
  tabla `users` propia con columnas de dominio — Supabase Auth guarda su
  propio modelo de usuario en `auth.users`, separado del `public.users` de
  la aplicación, lo que hubiera obligado a sincronizar dos tablas de
  usuario en vez de tener una sola.
- El flujo de login con Google ya estaba resuelto de forma directa
  (verificar el `id_token` con la librería de Google) sin necesitar que
  Supabase intermedie ese intercambio.
- Usar el JWT propio simplifica el guard de NestJS (`@Auth(ValidRoles.admin)`
  ya validaba exactamente lo que hacía falta) sin aprender ni depender del
  ciclo de vida de sesión de Supabase Auth (refresh tokens, cookies,
  invalidación).

## Decisión

La autenticación es **propia**, dentro del módulo `auth` de NestJS:

- Usuarios en `public.users` (una sola tabla, con `roles: text[]`,
  `password` nullable para cuentas solo-Google, `googleId` para vincular).
- Login con contraseña: `bcrypt.compareSync` contra el hash guardado.
- Login con Google: se verifica el `id_token` recibido del cliente contra
  `google-auth-library`, y si el correo ya existe se enlaza la cuenta
  (`googleId`) en vez de crear un duplicado.
- Sesión: JWT propio (`@nestjs/jwt`), firmado con un secreto propio
  (`JWT_SECRET`), validado por una `JwtStrategy` de Passport que carga el
  usuario en cada request.
- Autorización: decorador `@Auth(ValidRoles.admin)` sobre los endpoints que
  lo requieren — es la única barrera real para el panel de administración,
  porque la API se conecta a Postgres como propietaria de las tablas.

**No** se usa Supabase Auth ni `auth.uid()` como mecanismo de autorización
del lado de la aplicación.

## Consecuencias

**Positivas**

- Un solo modelo de usuario, en una sola tabla, sin sincronizar dos
  sistemas de identidad.
- Control total sobre el ciclo de vida del token (expiración, formato del
  payload, qué guarda) sin acoplarse a las decisiones de producto de
  Supabase Auth.
- Menos superficie nueva que aprender para un equipo ya familiarizado con
  Passport/JWT en NestJS.

**Negativas — deuda técnica documentada, no descubierta tarde**

- **Las políticas RLS que dependen de `auth.uid()` no protegen nada hoy.**
  Al escribir `supabase/migrations/0010_rls_policies.sql` (políticas de
  `users`/`appointments`) y `0015_rls_catalogo.sql` (`appointment_items`)
  se usó `auth.uid() = "userId"` siguiendo el patrón estándar de
  Supabase+RLS — pero como la app no usa Supabase Auth, ese valor es
  siempre `NULL` para cualquier request que llegue por PostgREST con el JWT
  propio. Las políticas están escritas y probadas (ver el propio archivo de
  migración, que lo señala explícitamente) para que la regla sea explícita
  y funcione tal cual el día que se decida migrar a Supabase Auth, pero
  **hoy no hay que asumir que esa capa filtra nada** para esas dos tablas.
  Lo que sí protege esas rutas es que la API nunca expone `userId` de otro
  usuario en sus propios endpoints — la protección real vive en el
  backend, no en RLS, para esas dos tablas puntuales.
- Reimplementar lo que Supabase Auth da gratis: si en el futuro hace falta
  verificación de email, recuperación de contraseña con enlace firmado, o
  login con más proveedores OAuth, hay que construirlo a mano en vez de
  activarlo en un panel.
- Un futuro cambio a Supabase Auth (si algún día se necesita, p. ej. para
  que las políticas RLS de `appointment_items` empiecen a filtrar de
  verdad) implica migrar usuarios existentes y su relación con
  `appointments`/`appointment_items`, no es un cambio de configuración.
- **El JWT vive en `localStorage`, no en una cookie — limitación conocida
  para cualquier verificación a nivel de servidor/edge.** El frontend es
  un SPA (React Router, sin SSR): el HTML que devuelve Vercel para `/`,
  `/auth/login` o `/admin` es literalmente el mismo shell vacío en los
  tres casos — la protección real (mostrar el login, bloquear `/admin` a
  quien no es admin) la aplica el JavaScript en el navegador con
  `ProtectedRoute`, después de que el HTML ya se sirvió. Como el token
  vive en `localStorage` (no en una cookie), un Edge Middleware de Vercel
  no puede leerlo para decidir si servir 401/redirect antes del HTML —
  el servidor no tiene forma de saber si hay sesión. Un escáner que solo
  inspecciona el HTML crudo (sin ejecutar JS) ve el mismo shell en toda
  ruta y puede reportarlo como "contenido sin proteger" — no lo es: no
  hay dato de negocio en ese HTML, y cada llamada a la API sí exige el
  JWT (ver más arriba). Arreglar esto de raíz a nivel HTTP requeriría
  migrar el token a una cookie `httpOnly` + agregar un Edge Middleware
  que verifique sesión antes de servir la página — cambio grande, no
  hecho todavía porque no hay una fuga real de datos que lo justifique
  hoy, solo una limitación de cómo un escáner sin JS interpreta un SPA.
