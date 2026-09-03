import { Link } from "react-router";

import type { Service } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { serviceImage } from "../lib/service-image";

interface Props {
    service: Service;
}

export const ProductCard = ({ service }: Props) => {
    const to = `/product/${service.slug}`;

    return (
        <Card className="group border-0 shadow-none product-card-hover">
            <CardContent className="p-0">
                <Link to={to} className="block">
                    <div className="relative aspect-square overflow-hidden bg-muted rounded-lg">
                        <img
                            src={serviceImage(service.image, service.category)}
                            alt={service.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="image-overlay" />
                    </div>
                </Link>

                <div className="pt-6 px-4 pb-4 space-y-3">
                    <div className="space-y-1">
                        <Link to={to}>
                            <h3 className="font-medium text-sm tracking-tight hover:underline">
                                {service.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground uppercase">
                            {service.category}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-lg">${service.price}</p>
                            <p className="text-xs text-muted-foreground">
                                {service.durationMin} min
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
