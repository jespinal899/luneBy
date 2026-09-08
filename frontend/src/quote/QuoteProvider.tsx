import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { QuoteContext, type QuoteItem } from './quote-context';

const STORAGE_KEY = 'luneby_quote';

type Action =
  | { type: 'add'; item: QuoteItem }
  | { type: 'remove'; serviceId: string }
  | { type: 'clear' };

const reducer = (state: QuoteItem[], action: Action): QuoteItem[] => {
  switch (action.type) {
    case 'add':
      return state.some((i) => i.serviceId === action.item.serviceId)
        ? state
        : [...state, action.item];
    case 'remove':
      return state.filter((i) => i.serviceId !== action.serviceId);
    case 'clear':
      return [];
  }
};

const loadInitial = (): QuoteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as QuoteItem[]) : [];
  } catch {
    return [];
  }
};

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [items, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: la cotización solo vive en memoria */
    }
  }, [items]);

  const value = useMemo(() => {
    const has = (id: string) => items.some((i) => i.serviceId === id);
    return {
      items,
      total: items.reduce((sum, i) => sum + i.price, 0),
      totalDuration: items.reduce((sum, i) => sum + i.durationMin, 0),
      count: items.length,
      isInQuote: has,
      add: (item: QuoteItem) => dispatch({ type: 'add', item }),
      remove: (serviceId: string) => dispatch({ type: 'remove', serviceId }),
      toggle: (item: QuoteItem) =>
        dispatch(
          has(item.serviceId)
            ? { type: 'remove', serviceId: item.serviceId }
            : { type: 'add', item },
        ),
      clear: () => dispatch({ type: 'clear' }),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [items, isOpen]);

  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
};
