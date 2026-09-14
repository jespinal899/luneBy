/**
 * Registra el service worker (public/sw.js) para que el sitio funcione
 * como PWA: app shell instalable y navegación básica sin conexión.
 * En `dev` no se registra a propósito, para no cachear el servidor de
 * Vite mientras se trabaja en el proyecto.
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error: unknown) => {
        console.error('No se pudo registrar el service worker:', error);
      });
  });
}
