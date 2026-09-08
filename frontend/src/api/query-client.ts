import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min sin refetch (los hooks lo afinan por consulta)
      gcTime: 1000 * 60 * 60 * 24, // 24 h — necesario para que el persist restaure
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Guarda la caché de queries en localStorage: al recargar la página o volver
 * más tarde, el catálogo aparece al instante mientras se revalida en segundo
 * plano. Solo se persiste el catálogo público (ver `luneby.tsx`).
 */
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'luneby_query_cache',
});

/** Súbelo si cambia la forma de los datos cacheados; invalida lo persistido. */
export const CACHE_BUSTER = 'luneby-1';
