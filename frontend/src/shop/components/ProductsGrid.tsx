import { ImageOff } from 'lucide-react';

import type { CatalogItem } from '@/api/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

interface Props {
    items: CatalogItem[];
    viewMode?: 'grid' | 'list';
    emptyMessage?: string;
}

/**
 * La cantidad de columnas se ajusta a cuántos diseños hay: con una o dos
 * entradas, una grilla fija de 3 columnas dejaba huecos enormes y parecía
 * que la página estaba rota.
 */
const gridColumns = (count: number) => {
    if (count === 1) return 'max-w-sm';
    if (count === 2) return 'sm:grid-cols-2 max-w-3xl';
    return 'sm:grid-cols-2 lg:grid-cols-3';
};

export const ProductsGrid = ({
    items,
    viewMode = 'grid',
    emptyMessage = 'No hay diseños que coincidan con la búsqueda.',
}: Props) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand/20 py-20 text-center">
                <ImageOff className="h-8 w-8 text-brand/40" />
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                viewMode === 'grid'
                    ? cn('grid gap-6', gridColumns(items.length))
                    : 'space-y-4',
            )}
        >
            {items.map((item) => (
                <ProductCard key={item.id} item={item} />
            ))}
        </div>
    );
};
