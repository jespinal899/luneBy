import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router';

import type { CatalogItem } from '@/api/types';
import { formatDuration, formatLps } from '../lib/format';
import { serviceImage } from '../lib/service-image';

interface Props {
    item: CatalogItem;
}

export const ProductCard = ({ item }: Props) => {
    const to = `/product/${item.id}`;

    return (
        <Link
            to={to}
            className="group flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                    src={serviceImage(item.image, item.category)}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-brand-dark backdrop-blur">
                    {item.category}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-medium leading-snug text-brand-dark">
                    {item.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-brand/10 pt-4">
                    <div>
                        <p className="text-xl font-semibold text-brand-dark">
                            {formatLps(item.price)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(item.durationMin)}
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-transform duration-300 group-hover:translate-x-0.5">
                        Reservar
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
            </div>
        </Link>
    );
};
