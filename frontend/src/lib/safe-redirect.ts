/**
 * Valida un destino de redirección que viene de fuera (la query string).
 *
 * Sin esto habría un *open redirect*: un enlace tipo
 * `/auth/login?from=https://sitio-falso.com` haría que, apenas la clienta
 * inicia sesión, la app la mande a un sitio ajeno — que puede imitar al
 * nuestro y pedirle la contraseña otra vez. Solo se aceptan rutas internas.
 */
export const safeInternalPath = (
  value: string | null | undefined,
  fallback = '/',
): string => {
  if (!value) return fallback;
  // Debe ser una ruta absoluta dentro del sitio.
  if (!value.startsWith('/')) return fallback;
  // `//host` es protocol-relative: el navegador lo resuelve como externo.
  if (value.startsWith('//')) return fallback;
  // Algunos navegadores normalizan `\` a `/`, así que `/\evil.com` escaparía.
  if (value.includes('\\')) return fallback;
  return value;
};
