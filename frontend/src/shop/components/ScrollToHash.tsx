import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Cuando la URL trae un hash (p. ej. `/#servicios`), desplaza a esa sección.
 * react-router con `createBrowserRouter` no lo hace de forma automática.
 */
export const ScrollToHash = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.slice(1);
    let tries = 0;

    // La sección puede estar montándose todavía (datos en carga): reintenta.
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 10) {
        window.setTimeout(scroll, 80);
      }
    };

    const raf = window.requestAnimationFrame(scroll);
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, hash, key]);

  return null;
};
