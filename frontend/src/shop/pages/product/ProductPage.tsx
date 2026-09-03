import { ArrowLeft, CalendarCheck, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/shop/components/ProductsGrid';
import { useService, useServices } from '@/shop/hooks/use-services';
import { serviceImage } from '@/shop/lib/service-image';

export const ProductPage = () => {
    const { idSlug } = useParams();
    const { data: service, isLoading, isError } = useService(idSlug);

    const { data: related } = useServices({ limit: 4 });
    const relatedServices = (related?.products ?? []).filter(
        (s) => s.isActive && s.id !== service?.id && s.category === service?.category,
    );

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 text-center text-muted-foreground lg:px-8">
                Cargando servicio…
            </div>
        );
    }

    if (isError || !service) {
        return (
            <div className="container mx-auto px-4 py-24 text-center lg:px-8">
                <p className="text-muted-foreground">No encontramos ese servicio.</p>
                <Button variant="outline" render={<Link to="/shop" />} className="mt-4">
                    Volver al catálogo
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 lg:px-8">
            <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Todos los servicios
            </Link>

            <div className="mt-6 grid gap-10 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl bg-muted">
                    <img
                        src={serviceImage(service.image, service.category)}
                        alt={service.name}
                        className="aspect-square w-full object-cover"
                    />
                </div>

                <div className="flex flex-col">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {service.category}
                    </p>
                    <h1 className="mt-2 font-montserrat text-3xl tracking-tight">
                        {service.name}
                    </h1>

                    <div className="mt-4 flex items-center gap-6">
                        <span className="text-2xl font-semibold">${service.price}</span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.durationMin} min
                        </span>
                    </div>

                    {service.description && (
                        <p className="mt-6 text-muted-foreground">{service.description}</p>
                    )}

                    <div className="mt-auto pt-8">
                        <Button
                            size="lg"
                            className="h-11 px-6"
                            render={<Link to={`/shop/agendar?serviceId=${service.id}`} />}
                        >
                            <CalendarCheck className="h-4 w-4" />
                            Agendar este servicio
                        </Button>
                    </div>
                </div>
            </div>

            {relatedServices.length > 0 && (
                <div className="mt-20">
                    <h2 className="mb-8 font-montserrat text-2xl tracking-tight">
                        Servicios relacionados
                    </h2>
                    <ProductsGrid services={relatedServices} />
                </div>
            )}
        </div>
    );
};
