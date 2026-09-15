import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useServices } from '@/shop/hooks/use-services';
import { PRICE_BANDS } from '../lib/categories';

export const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // El catálogo se filtra por servicio, que es la agrupación que la
    // administradora define desde el panel. Antes se filtraba por categoría,
    // una lista fija en el código que ella no podía cambiar.
    const { data } = useServices({ limit: 100 });
    const services = data?.products ?? [];

    const currentServices = (
        searchParams.get('servicios')?.split(',') ?? []
    ).filter(Boolean);
    const currentPrice = searchParams.get('price') || 'any';

    const toggleService = (id: string) => {
        const next = currentServices.includes(id)
            ? currentServices.filter((s) => s !== id)
            : [...currentServices, id];

        searchParams.set('page', '1');
        if (next.length) searchParams.set('servicios', next.join(','));
        else searchParams.delete('servicios');
        setSearchParams(searchParams);
    };

    const changePrice = (price: string) => {
        searchParams.set('page', '1');
        if (price === 'any') searchParams.delete('price');
        else searchParams.set('price', price);
        setSearchParams(searchParams);
    };

    return (
        <div className="w-64 space-y-6">
            <h3 className="mb-4 text-lg font-semibold">Filtros</h3>

            <div className="space-y-4">
                <h4 className="font-medium">Servicios</h4>
                <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                        <Button
                            key={service.id}
                            variant={
                                currentServices.includes(service.id)
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            className="h-8"
                            onClick={() => toggleService(service.id)}
                        >
                            {service.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h4 className="font-medium">Precio</h4>
                <RadioGroup value={currentPrice} className="space-y-3">
                    {PRICE_BANDS.map(({ value, label }) => (
                        <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem
                                value={value}
                                id={`price-${value}`}
                                checked={currentPrice === value}
                                onClick={() => changePrice(value)}
                            />
                            <Label
                                htmlFor={`price-${value}`}
                                className="cursor-pointer text-sm"
                            >
                                {label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
};
