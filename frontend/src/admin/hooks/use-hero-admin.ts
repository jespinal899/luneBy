import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateHero, type Hero } from '@/shop/api/site-content.actions';

/**
 * Guarda la portada.
 *
 * Invalida `site-content` para que la portada pública muestre lo nuevo sin
 * recargar la página: es lo primero que va a mirar la administradora después
 * de guardar.
 */
export const useUpdateHero = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Hero) => updateHero(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['site-content'] }),
  });
};
