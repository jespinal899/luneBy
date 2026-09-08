import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router';

import { CACHE_BUSTER, persister, queryClient } from './api/query-client';
import { appRouter } from './app.router';
import { AuthProvider } from './auth/context/AuthProvider';

export const Luneby = () => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 h
        buster: CACHE_BUSTER,
        // Solo se guarda el catálogo público; las citas no se persisten.
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            return (
              query.state.status === 'success' &&
              (key === 'services' || key === 'service')
            );
          },
        },
      }}
    >
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};
