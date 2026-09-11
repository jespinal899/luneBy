import { Link, useRouteError } from 'react-router';

import { Button } from '@/components/ui/button';

/**
 * `errorElement` de la ruta raíz: cubre URLs inexistentes y errores de render
 * en las rutas hijas.
 */
export const NotFoundPage = () => {
  const error = useRouteError();
  const is404 =
    !error ||
    (typeof error === 'object' && 'status' in error && error.status === 404);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <p className="font-display text-6xl text-brand">{is404 ? '404' : 'Ups'}</p>
      <h1 className="font-display text-2xl text-brand-dark">
        {is404 ? 'Página no encontrada' : 'Algo salió mal'}
      </h1>
      <p className="max-w-sm text-sm text-brand-dark/60">
        {is404
          ? 'La dirección que buscas no existe o cambió de lugar.'
          : 'Ha ocurrido un error inesperado. Intenta recargar la página.'}
      </p>
      <Button
        render={<Link to="/" />}
        className="mt-2 rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
      >
        Volver al inicio
      </Button>
    </div>
  );
};
