import type { Service } from "@/api/types";
import { ProductCard } from "./ProductCard";

interface Props {
    services: Service[];
    viewMode?: "grid" | "list";
    emptyMessage?: string;
}

export const ProductsGrid = ({
    services,
    viewMode = "grid",
    emptyMessage = "No hay servicios que coincidan con la búsqueda.",
}: Props) => {
    if (services.length === 0) {
        return (
            <p className="py-16 text-center text-muted-foreground">{emptyMessage}</p>
        );
    }

    return (
        <div
            className={
                viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
            }
        >
            {services.map((service) => (
                <ProductCard key={service.id} service={service} />
            ))}
        </div>
    );
};
