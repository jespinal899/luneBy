import { describe, expect, it } from 'vitest';

import { CACHE_BUSTER, persister, queryClient } from './query-client';

describe('query-client', () => {
  it('expone un QueryClient con retry limitado y sin refetch en foco', () => {
    const opts = queryClient.getDefaultOptions();
    expect(opts.queries?.retry).toBe(1);
    expect(opts.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('el persister guarda y recupera un cliente serializado', async () => {
    const client = {
      timestamp: Date.now(),
      buster: CACHE_BUSTER,
      clientState: { queries: [], mutations: [] },
    };

    await persister.persistClient(client as never);
    const restored = await persister.restoreClient();

    expect(restored).toEqual(client);

    await persister.removeClient();
    expect(await persister.restoreClient()).toBeUndefined();
  });
});
