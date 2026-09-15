import type { Service } from '@/api/types';
import {
  catalogItemToQuoteItem,
  toQuoteItem,
  type QuoteItem,
} from '@/quote/quote-context';
import { useQuote } from '@/quote/use-quote';
import { useCatalog } from '@/shop/hooks/use-catalog';
import { formatLps } from '@/shop/lib/format';

/**
 * Diseños de un servicio ya elegido, para que la clienta escoja uno.
 *
 * Elegir diseño es opcional: si no escoge ninguno se agenda el servicio a su
 * precio base. Así un servicio al que todavía no se le cargaron diseños se
 * puede reservar igual.
 *
 * El precio del diseño se SUMA al del servicio: hacer un Soft Glam es hacer
 * el esmaltado y además el diseño. Se muestra el total, con el adicional
 * debajo, para que no haya sorpresas al llegar a la cotización.
 *
 * La duración siempre sale del servicio, también cuando hay diseño: es lo que
 * usa el cálculo de horarios, y el diseño no debe mover la agenda.
 */
export const DesignPicker = ({ service }: { service: Service }) => {
  const quote = useQuote();
  const { data, isLoading } = useCatalog({
    servicios: service.id,
    // Son los diseños de un solo servicio: no hace falta paginar.
    limit: 50,
  });

  const designs = data?.products ?? [];
  const chosen = quote.items.find((i) => i.serviceId === service.id);

  if (isLoading) {
    return (
      <div aria-hidden className="mt-3 space-y-2">
        <div className="h-9 animate-pulse rounded-lg bg-brand/10" />
        <div className="h-9 animate-pulse rounded-lg bg-brand/10" />
      </div>
    );
  }

  // Sin diseños cargados no hay nada que elegir: se agenda el servicio solo y
  // no se muestra un paso vacío.
  if (designs.length === 0) return null;

  const pick = (item: QuoteItem) => quote.choose(item);

  const optionClass = (isSelected: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
      isSelected
        ? 'border-brand bg-brand/10 text-brand-dark'
        : 'border-brand/15 text-muted-foreground hover:border-brand/40'
    }`;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">
        Elige el diseño
      </p>

      <button
        type="button"
        aria-pressed={!chosen?.catalogItemId}
        onClick={() => pick(toQuoteItem(service))}
        className={optionClass(!chosen?.catalogItemId)}
      >
        <span>Sin diseño específico</span>
        <span className="shrink-0 font-medium">{formatLps(service.price)}</span>
      </button>

      {designs.map((design) => (
        <button
          key={design.id}
          type="button"
          aria-pressed={chosen?.catalogItemId === design.id}
          onClick={() => pick(catalogItemToQuoteItem(design))}
          className={optionClass(chosen?.catalogItemId === design.id)}
        >
          <span className="min-w-0 truncate">{design.name}</span>
          <span className="shrink-0 text-right">
            <span className="block font-medium">
              {formatLps(service.price + design.price)}
            </span>
            {design.price > 0 && (
              <span className="block text-[11px] text-muted-foreground">
                +{formatLps(design.price)}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
