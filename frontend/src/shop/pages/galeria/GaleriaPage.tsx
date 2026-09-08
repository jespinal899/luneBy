import { Link } from 'react-router';
import { CalendarCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sparkle } from '@/components/Sparkle';
import { useServices } from '@/shop/hooks/use-services';
import { serviceImage } from '@/shop/lib/service-image';

export const GaleriaPage = () => {
  const { data, isLoading } = useServices({ limit: 30, kind: 'base' });
  const items = (data?.products ?? []).filter((s) => s.isActive);

  return (
    <div className="bg-cream">
      <div className="container mx-auto px-4 py-16 lg:px-8 lg:py-20">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand/70">
          <Sparkle className="h-3.5 w-3.5" />
          Galería
        </p>
        <h1 className="mt-4 font-display text-4xl text-brand-dark sm:text-5xl">
          Trabajos del estudio
        </h1>
        <p className="mt-4 max-w-lg text-brand-dark/70">
          Una muestra de manicura, acrílico y nail art hechos en Luné by Kelin.
        </p>

        {isLoading ? (
          <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 aspect-[3/4] w-full animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {items.map((s) => (
              <Link
                key={s.id}
                to={`/product/${s.slug}`}
                className="group mb-4 block overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={serviceImage(s.image, s.category)}
                  alt={s.name}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            size="lg"
            render={<Link to="/shop/agendar" />}
            className="h-11 rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
          >
            <CalendarCheck className="h-4 w-4" />
            Quiero unas así
          </Button>
        </div>
      </div>
    </div>
  );
};
