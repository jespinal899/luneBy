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

const CACHE_NAME = 'fiados-v3';

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
      .then((cache) => cache.addAll(APP_SHELL))
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

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

/** Network first: intenta la red; si falla (offline), cae al shell cacheado. */
async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
    throw new Error('Sin conexión y sin app shell en caché');
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
