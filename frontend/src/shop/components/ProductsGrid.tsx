import type { CatalogItem } from '@/api/types';
import { ProductCard } from './ProductCard';

interface Props {
    items: CatalogItem[];
    viewMode?: 'grid' | 'list';
    emptyMessage?: string;
}

export const ProductsGrid = ({
    items,
    viewMode = 'grid',
    emptyMessage = 'No hay diseños que coincidan con la búsqueda.',
}: Props) => {
    if (items.length === 0) {
        return (
            <p className="py-16 text-center text-muted-foreground">{emptyMessage}</p>
        );
    }

    return (
        <div
            className={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
            }
        >
            {items.map((item) => (
                <ProductCard key={item.id} item={item} />
            ))}
        </div>
    );
};
