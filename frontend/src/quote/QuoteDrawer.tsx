import { Dialog } from '@base-ui/react/dialog';
import { CalendarCheck, Trash2, X } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { formatDuration, formatLps } from '@/shop/lib/format';
import { useQuote } from './use-quote';

/** Drawer lateral con la cotización en curso. Se abre desde el header. */
export const QuoteDrawer = () => {
  const { items, total, totalDuration, isOpen, close, remove, clear } =
    useQuote();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="font-display text-lg text-brand-dark">
              Tu cotización
            </Dialog.Title>
            <Dialog.Close
              aria-label="Cerrar"
              className="rounded-full p-1.5 text-brand-dark/60 transition-colors hover:bg-brand/5 hover:text-brand-dark"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no has añadido servicios a tu cotización.
              </p>
              <Button
                variant="outline"
                size="sm"
                render={<Link to="/shop" onClick={close} />}
              >
                Ver servicios
              </Button>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y overflow-y-auto px-5">
                {items.map((it) => (
                  <li
                    key={it.serviceId}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-dark">
                        {it.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(it.durationMin)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-dark">
                      {formatLps(it.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(it.serviceId)}
                      aria-label={`Quitar ${it.name}`}
                      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total estimado
                  </span>
                  <span className="font-display text-2xl text-brand-dark">
                    {formatLps(total)}
                  </span>
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  Tiempo aprox. {formatDuration(totalDuration)}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Vaciar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    render={
                      <Link
                        to={`/shop/agendar?serviceId=${items[0].serviceId}`}
                        onClick={close}
                      />
                    }
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Agendar
                  </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Es una estimación. Al agendar eliges el día y la hora.
                </p>
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
