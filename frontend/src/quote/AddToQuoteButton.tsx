import { Check, Plus } from 'lucide-react';

import type { Service } from '@/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toQuoteItem } from './quote-context';
import { useQuote } from './use-quote';

interface Props {
  service: Service;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
}

/** Botón que añade / quita un servicio de la cotización. */
export const AddToQuoteButton = ({
  service,
  className,
  size = 'sm',
}: Props) => {
  const { isInQuote, toggle, open } = useQuote();
  const inQuote = isInQuote(service.id);

  return (
    <Button
      type="button"
      size={size}
      variant={inQuote ? 'secondary' : 'outline'}
      onClick={() => {
        toggle(toQuoteItem(service));
        if (!inQuote) open();
      }}
      className={cn(className)}
    >
      {inQuote ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {inQuote ? 'En la cotización' : 'Cotizar'}
    </Button>
  );
};
