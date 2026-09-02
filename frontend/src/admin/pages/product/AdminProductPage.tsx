import { AdminTitle } from '@/admin/components/AdminTitle';
import { useParams, Link } from 'react-router';

import { useState } from 'react';
import { X, Upload, SaveAll, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, products } from '@/mocks/products.mock';

interface Service {
    id: string;
    name: string;
    price: number;
    durationMin: number;
    category: string;
    description: string;
    isActive: boolean;
    image: string;
}

const emptyService: Service = {
    id: 'new',
    name: '',
    price: 0,
    durationMin: 60,
    category: CATEGORIES[0],
    description: '',
    isActive: true,
    image: '',
};

export const AdminProductPage = () => {
    const { id } = useParams();
    const isNew = id === 'new';

    const existing = products.find((p) => p.id === id);

    const title = isNew ? 'Nuevo servicio' : 'Editar servicio';
    const subtitle = isNew
        ? 'Crea un servicio de uñas que tus clientas podrán agendar.'
        : 'Actualiza la información de este servicio.';

    const [service, setService] = useState<Service>(
        existing
            ? {
                  id: existing.id,
                  name: existing.name,
                  price: existing.price,
                  durationMin: existing.durationMin,
                  category: existing.category,
                  description: existing.description,
                  isActive: existing.isActive,
                  image: existing.image,
              }
            : emptyService
    );

    const handleChange = <K extends keyof Service>(field: K, value: Service[K]) => {
        setService((prev) => ({ ...prev, [field]: value }));
    };

    const inputClass =
        'w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900/20';

    return (
        <>
            <div className="flex items-center justify-between">
                <AdminTitle title={title} subtitle={subtitle} />
                <div className="mb-10 flex justify-end gap-4">
                    <Button variant="outline" render={<Link to="/admin/products" />}>
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button>
                        <SaveAll className="h-4 w-4" />
                        Guardar cambios
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Formulario principal */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-slate-800">
                            Información del servicio
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Nombre del servicio
                                </label>
                                <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ej: Manicura Rusa Premium"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Precio ($)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            value={service.price}
                                            onChange={(e) =>
                                                handleChange('price', parseFloat(e.target.value) || 0)
                                            }
                                            className={`${inputClass} pl-9`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Duración (minutos)
                                    </label>
                                    <div className="relative">
                                        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min={0}
                                            step={15}
                                            value={service.durationMin}
                                            onChange={(e) =>
                                                handleChange(
                                                    'durationMin',
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            className={`${inputClass} pl-9`}
                                            placeholder="60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Categoría
                                </label>
                                <select
                                    value={service.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    className={inputClass}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Descripción
                                </label>
                                <textarea
                                    value={service.description}
                                    onChange={(e) =>
                                        handleChange('description', e.target.value)
                                    }
                                    rows={5}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Describe en qué consiste el servicio, qué incluye y su duración aproximada."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra lateral */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-slate-800">
                            Imagen del servicio
                        </h2>

                        {service.image ? (
                            <div className="relative">
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                                />
                                <button
                                    onClick={() => handleChange('image', '')}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-all hover:border-slate-400">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    onChange={(e) => console.log(e.target.files)}
                                />
                                <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                <p className="mt-2 text-sm font-medium text-slate-700">
                                    Sube una foto del resultado
                                </p>
                                <p className="text-xs text-slate-400">PNG o JPG hasta 10MB</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">
                            Disponibilidad
                        </h2>

                        <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Visible para agendar
                                </p>
                                <p className="text-xs text-slate-400">
                                    Las clientas podrán reservar este servicio
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={service.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="h-5 w-5 accent-slate-900"
                            />
                        </label>

                        <div className="mt-4 flex items-center justify-between p-3 text-sm">
                            <span className="font-medium text-slate-700">Duración</span>
                            <span className="text-slate-600">{service.durationMin} min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 text-sm">
                            <span className="font-medium text-slate-700">Precio</span>
                            <span className="text-slate-600">
                                ${service.price.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
