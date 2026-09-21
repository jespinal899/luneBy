/**
 * Registra el service worker (public/sw.js) para que el sitio funcione
 * como PWA: app shell instalable y navegación básica sin conexión.
 * En `dev` no se registra a propósito, para no cachear el servidor de
 * Vite mientras se trabaja en el proyecto.
 *
 * Además mantiene la app al día. Antes solo registraba: una pestaña abierta
 * podía quedarse con la versión vieja hasta que alguien cerrara todas, y en
 * una PWA instalada eso puede ser semanas.
 */

/** Cada cuánto preguntar si hay una versión nueva. */
const INTERVALO_REVISION = 60 * 60 * 1000; // 1 h

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  // Si ya había uno controlando la página, el relevo significa que entró
  // una versión nueva y hay que recargar para usarla. En la primera visita
  // no hay controlador, y entonces el relevo es solo la instalación
  // inicial: recargar ahí sería un parpadeo sin motivo.
  const yaControlada = Boolean(navigator.serviceWorker.controller);
  let recargando = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!yaControlada || recargando) return;
    recargando = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registro) => {
        // El navegador solo revisa por su cuenta de vez en cuando. Se le
        // pregunta al volver a la pestaña y cada hora, que es cuando una
        // versión nueva importa: justo antes de que la clienta la use.
        const revisar = () => void registro.update().catch(() => {});

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') revisar();
        });
        window.setInterval(revisar, INTERVALO_REVISION);
      })
      .catch((error: unknown) => {
        console.error('No se pudo registrar el service worker:', error);
      });
  });
}
