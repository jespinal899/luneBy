import { useState } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/Custom/CustomPagination';
import { FilterSidebar } from '@/shop/components/FilterSidebar';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { useServices } from '@/shop/hooks/use-services';

const PAGE_SIZE = 9;

export const ShopPage = () => {
    const [params, setParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const page = Math.max(1, Number(params.get('page')) || 1);
    const viewMode = params.get('viewMode') === 'list' ? 'list' : 'grid';

    const { data, isLoading, isError } = useServices({
        page,
        limit: PAGE_SIZE,
        q: params.get('query') ?? undefined,
        categorias: params.get('categorias') ?? undefined,
        price: params.get('price') ?? undefined,
    });

    const services = (data?.products ?? []).filter((s) => s.isActive);

    const setViewMode = (mode: 'grid' | 'list') => {
        params.set('viewMode', mode);
        setParams(params);
    };

    return (
        <section className="px-4 py-12 lg:px-8">
            <div className="container mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-light">Servicios</h1>
                        {data && (
                            <span className="text-muted-foreground">({data.count})</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setShowFilters(true)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>

                        <div className="hidden rounded-md border md:flex">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-r-none"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-l-none"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    <aside className="hidden lg:block">
                        <FilterSidebar />
                    </aside>

                    {showFilters && (
                        <div className="fixed inset-0 z-50 bg-background p-4 lg:hidden">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Filtros</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                            <FilterSidebar />
                        </div>
                    )}

                    <div className="flex-1">
                        {isLoading ? (
                            <p className="py-16 text-center text-muted-foreground">
                                Cargando servicios…
                            </p>
                        ) : isError ? (
                            <p className="py-16 text-center text-destructive">
                                No se pudieron cargar los servicios.
                            </p>
                        ) : (
                            <>
                                <ProductsGrid services={services} viewMode={viewMode} />
                                {data && data.pages > 1 && (
                                    <div className="mt-12">
                                        <CustomPagination totalPages={data.pages} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
