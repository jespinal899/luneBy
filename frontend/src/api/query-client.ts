import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minuto sin refetch automático
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
