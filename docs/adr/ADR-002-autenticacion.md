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
  no puede leerlo ni validar su firma antes de servir el HTML. Un escáner
  que solo inspecciona el HTML crudo (sin ejecutar JS) veía el mismo shell
  en toda ruta y lo reportaba como "contenido sin proteger" — no lo es:
  no hay dato de negocio en ese HTML, y cada llamada a la API sí exige el
  JWT (ver más arriba).

  **Mitigación parcial adoptada (cookie marcadora + Edge Middleware).**
  `AuthProvider` deja una cookie `luneby_session=1` al iniciar sesión y la
  borra al cerrarla. No lleva el token ni dato alguno del usuario: solo
  declara "este navegador tiene una sesión abierta". Con eso,
  `frontend/middleware.ts` responde un 307 al login en `/admin`, `/perfil`
  y `/mis-citas` cuando la cookie falta, en vez de servir el shell.

  Lo que esto **sí** resuelve: la UX (antes se veía un shell en blanco
  parpadeando hasta que arrancaba el JS y el guard redirigía) y la
  semántica HTTP (la respuesta ahora refleja el estado de sesión).

  Lo que esto **no** es: una barrera de seguridad. La cookie es
  falsificable a mano, y quien la fabrique recibe el shell — que sigue sin
  contener datos. La autorización real no cambió de lugar: está en la API,
  que exige un JWT firmado y válido para devolver cualquier dato, y en
  `ProtectedRoute`, que valida el rol contra el usuario real.

  **Deuda pendiente:** el arreglo de raíz sigue siendo migrar el token a
  una cookie `httpOnly; Secure; SameSite=None` y que el middleware valide
  la firma en el borde. No se hizo porque la API y el frontend viven en
  dominios distintos (Render y Vercel), lo que obliga a cookies
  cross-site, CORS con `credentials` y el `JWT_SECRET` replicado en
  Vercel: cuatro piezas que deben alinearse en una app ya en producción,
  a cambio de un beneficio marginal mientras el HTML no contenga datos
  (no hay SSR). Vale la pena revisarlo si aparece SSR, más cuentas de
  administración, o datos sensibles renderizados en el servidor.
