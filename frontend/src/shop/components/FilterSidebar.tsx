import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PRICE_BANDS, SERVICE_CATEGORIES } from '../lib/categories';

export const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentCategories = (searchParams.get('categorias')?.split(',') ?? []).filter(
        Boolean,
    );
    const currentPrice = searchParams.get('price') || 'any';

    const toggleCategory = (category: string) => {
        const next = currentCategories.includes(category)
            ? currentCategories.filter((c) => c !== category)
            : [...currentCategories, category];

        searchParams.set('page', '1');
        if (next.length) searchParams.set('categorias', next.join(','));
        else searchParams.delete('categorias');
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
                <h4 className="font-medium">Categorías</h4>
                <div className="grid grid-cols-2 gap-2">
                    {SERVICE_CATEGORIES.map((category) => (
                        <Button
                            key={category}
                            variant={
                                currentCategories.includes(category) ? 'default' : 'outline'
                            }
                            size="sm"
                            className="h-8"
                            onClick={() => toggleCategory(category)}
                        >
                            {category}
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
