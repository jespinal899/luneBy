import { useContext } from 'react';

import { QuoteContext } from './quote-context';

export const useQuote = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote debe usarse dentro de <QuoteProvider>');
  return ctx;
};
