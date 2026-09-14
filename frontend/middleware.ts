import { next } from '@vercel/edge';

/**
 * Redirige al login las rutas privadas cuando el navegador no declara
 * tener una sesión abierta.
 *
 * QUÉ ES Y QUÉ NO ES ESTO
 *
 * La app guarda el JWT en `localStorage` (ver ADR-002), que el servidor
 * no puede leer: por eso, hasta ahora, Vercel respondía exactamente el
 * mismo HTML —el shell vacío de la SPA— a cualquiera que pidiera
 * `/admin`, tuviera sesión o no, y el guard de React redirigía recién
 * después de que el JavaScript arrancaba (se veía un parpadeo en blanco).
 *
 * `AuthProvider` ahora deja una cookie marcadora (`luneby_session=1`) al
 * iniciar sesión y la borra al cerrarla. NO lleva el token ni ningún dato
 * del usuario: solo dice "este navegador tiene una sesión abierta", que
 * es justo lo que hace falta para poder responder un 307 al login en vez
 * de servir el shell.
 *
 * NO es una barrera de seguridad: cualquiera puede fabricarse esa cookie
 * a mano y recibir el shell. Da igual, porque ese HTML no contiene ni un
 * dato privado. La seguridad real está —y sigue estando— en la API, que
 * exige un JWT válido y firmado para devolver cualquier dato, y en el
 * guard `ProtectedRoute` del cliente, que valida el rol contra el usuario
 * real. Esto es corrección de UX y de semántica HTTP, no de seguridad.
 */

const SESSION_COOKIE = 'luneby_session';

export const config = {
  matcher: ['/admin', '/admin/:path*', '/perfil', '/mis-citas'],
};

export default function middleware(request: Request) {
  const cookies = request.headers.get('cookie') ?? '';
  const hasSession = cookies
    .split(';')
    .some((c) => c.trim().startsWith(`${SESSION_COOKIE}=`));

  if (hasSession) return next();

  const url = new URL(request.url);
  const login = new URL('/auth/login', url.origin);
  // Para que el login pueda devolver a la persona a donde quería ir.
  login.searchParams.set('from', url.pathname);

  return Response.redirect(login, 307);
}
