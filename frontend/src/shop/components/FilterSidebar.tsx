import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export const FilterSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentCategories = searchParams.get('categorias')?.split(',') || [];
    const currentPrice = searchParams.get('price') || 'any';

    const handleSizeChanged = (size: string) => {
        const newCategories = currentCategories.includes(size)
            ? currentCategories.filter((s) => s !== size)
            : [...currentCategories, size];

        searchParams.set('page', '1');
        searchParams.set('categorias', newCategories.join(','));
        setSearchParams(searchParams);
    };

    const handlePriceChange = (price: string) => {
        searchParams.set('page', '1');
        searchParams.set('price', price);
        setSearchParams(searchParams);
    };

    const sizes = [
        { id: "esmaltado", label: "Esmaltado" },
        { id: "acrilico", label: "Acrilico" },
        { id: "manicura", label: "Manicura" },
        { id: "semipermanente", label: "Semipermanente" },
        { id: "nail-art", label: "Nail Art" },
        { id: "pedicura", label: "Pedicura" },
    ];

    return (
        <div className="w-64 space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-4">Filtros</h3>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
                <h4 className="font-medium">Categorias</h4>
                <div className="grid grid-cols-2 gap-2">
                    {sizes.map((size) => (
                        <Button
                            key={size.id}
                            variant={currentCategories.includes(size.id) ? 'default' : 'outline'}
                            size="sm"
                            className="h-8"
                            onClick={() => handleSizeChanged(size.id)}
                        >
                            {size.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="font-medium">Precio</h4>
                <RadioGroup defaultValue="" className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="any"
                            id="priceAny"
                            checked={currentPrice === 'any'}
                            onClick={() => handlePriceChange('any')}
                        />
                        <Label htmlFor="priceAny" className="text-sm cursor-pointer">
                            Cualquier precio
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="0-50"
                            id="price1"
                            checked={currentPrice === '0-50'}
                            onClick={() => handlePriceChange('0-50')}
                        />
                        <Label htmlFor="price1" className="text-sm cursor-pointer">
                            $0 - $50
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="50-100"
                            id="price2"
                            checked={currentPrice === '50-100'}
                            onClick={() => handlePriceChange('50-100')}
                        />
                        <Label htmlFor="price2" className="text-sm cursor-pointer">
                            $50 - $100
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="100-200"
                            id="price3"
                            checked={currentPrice === '100-200'}
                            onClick={() => handlePriceChange('100-200')}
                        />
                        <Label htmlFor="price3" className="text-sm cursor-pointer">
                            $100 - $200
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="200+"
                            id="price4"
                            checked={currentPrice === '200+'}
                            onClick={() => handlePriceChange('200+')}
                        />
                        <Label htmlFor="price4" className="text-sm cursor-pointer">
                            $200+
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
};
