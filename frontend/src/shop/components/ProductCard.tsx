import { Link } from 'react-router';

import type { CatalogItem } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatLps } from '../lib/format';
import { serviceImage } from '../lib/service-image';

interface Props {
    item: CatalogItem;
}

export const ProductCard = ({ item }: Props) => {
    const to = `/product/${item.id}`;

    return (
        <Card className="group border-0 shadow-none product-card-hover">
            <CardContent className="p-0">
                <Link to={to} className="block">
                    <div className="relative aspect-square overflow-hidden bg-muted rounded-lg">
                        <img
                            src={serviceImage(item.image, item.category)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="image-overlay" />
                    </div>
                </Link>

                <div className="pt-6 px-4 pb-4 space-y-3">
                    <div className="space-y-1">
                        <Link to={to}>
                            <h3 className="font-medium text-sm tracking-tight hover:underline">
                                {item.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground uppercase">
                            {item.category}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-lg">
                                {formatLps(item.price)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.durationMin} min
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            render={<Link to={to} />}
                            className="text-xs px-4 py-2 h-8"
                        >
                            Reservar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
