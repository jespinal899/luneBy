import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Controla el scroll al navegar:
 * - Con hash (`/#servicios`) desplaza a esa sección (react-router con
 *   `createBrowserRouter` no lo hace solo).
 * - Sin hash, lleva la vista al inicio para no aterrizar a media página.
 */
export const ScrollToHash = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }

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
