// Service worker de Luné by Kelin.
//
// Estrategia principal: CACHE FIRST para el app shell y los assets
// estáticos (JS/CSS con hash de Vite, imágenes, fuentes, iconos) — se
// sirven directamente desde caché si ya existen, y solo se pide la red
// la primera vez que se ven, guardando la respuesta para las próximas.
//
// Las páginas HTML (navegación) usan NETWORK FIRST con fallback al shell
// cacheado, y las llamadas a la API (booking, catálogo, autenticación)
// van SIEMPRE por red, sin caché: son datos que cambian todo el tiempo
// (disponibilidad de horarios, precios) y servir una respuesta vieja
// podría hacer que alguien intente agendar un turno que ya no existe.
//
// Frontera offline/online, resumida:
//   - SIN internet: la interfaz (HTML/CSS/JS) y las imágenes/fuentes ya
//     visitadas antes siguen cargando, porque quedaron en caché.
//   - CON internet requerido: cualquier dato real (servicios, catálogo,
//     login, crear/ver citas) — todo lo que pasa por /api.

const CACHE_NAME = 'fiados-v4';

// Núcleo del app shell: lo mínimo para que la app arranque aunque no haya
// nada más en caché todavía. El resto (JS/CSS con hash, imágenes) se cachea
// solo, la primera vez que se piden (ver `cacheFirst` más abajo).
const APP_SHELL = ['/index.html', '/manifest.webmanifest', '/favicon.svg'];

const isApiRequest = (url) =>
  url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // Uno por uno y sin cortar: `addAll` es atómico, así que un solo
      // archivo que falle dejaba el service worker instalado SIN nada en
      // caché — y entonces el fallback de navegación no tenía a qué caer.
      .then((cache) =>
        Promise.allSettled(APP_SHELL.map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Cache first: sirve de caché si existe; si no, pide la red y guarda la copia. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Sin esto la promesa quedaba sin capturar y el navegador registraba un
    // "Uncaught (in promise) TypeError: Failed to fetch" por cada recurso
    // que no cargara. Devolver una respuesta de error deja que la página
    // siga su curso y falle solo ese recurso.
    return new Response('', { status: 504, statusText: 'Sin conexión' });
  }
}

/**
 * Network first: intenta la red y, de paso, refresca el shell guardado para
 * que la próxima vez sin conexión no se sirva uno viejo.
 */
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    // Cae al shell: primero el guardado, y si tampoco está, cualquier
    // navegación cacheada sirve — con la app cargada, el router resuelve la
    // ruta del lado del cliente.
    const cached =
      (await caches.match('/index.html')) || (await caches.match('/'));
    if (cached) return cached;

    // Antes se lanzaba un Error acá, y eso convertía la navegación en un
    // "network error response": el navegador mostraba su página de error en
    // vez de algo explicable.
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
        '<p style="font-family:sans-serif;padding:2rem">Sin conexión. ' +
        'Vuelve a intentarlo cuando tengas internet.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // POST/PUT/PATCH/DELETE nunca se cachean

  const url = new URL(request.url);

  // Datos reales de la API: siempre red, nunca caché.
  if (isApiRequest(url)) return;

  // Navegación (cargar una página): red primero, shell cacheado si falla.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Todo lo demás (JS/CSS/imágenes/fuentes del propio sitio): cache first.
  event.respondWith(cacheFirst(request));
});
