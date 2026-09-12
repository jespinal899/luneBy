import { Check, Plus } from 'lucide-react';

import type { CatalogItem } from '@/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { catalogItemToQuoteItem } from './quote-context';
import { useQuote } from './use-quote';

interface Props {
  item: CatalogItem;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
}

/** Botón que añade / quita de la cotización el servicio de un diseño. */
export const AddToQuoteButton = ({ item, className, size = 'sm' }: Props) => {
  const { isInQuote, toggle, open } = useQuote();
  const inQuote = isInQuote(item.serviceId);

  return (
    <Button
      type="button"
      size={size}
      variant={inQuote ? 'secondary' : 'outline'}
      onClick={() => {
        toggle(catalogItemToQuoteItem(item));
        if (!inQuote) open();
      }}
      className={cn(className)}
    >
      {inQuote ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {inQuote ? 'En la cotización' : 'Cotizar'}
    </Button>
  );
};
