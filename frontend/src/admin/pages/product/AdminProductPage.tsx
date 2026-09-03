import { useState } from 'react';
import { Clock, DollarSign, SaveAll, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import {
    useCreateService,
    useUpdateService,
} from '@/admin/hooks/use-service-mutations';
import { apiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import type { ServiceInput } from '@/shop/api/services.actions';
import { useService } from '@/shop/hooks/use-services';
import { SERVICE_CATEGORIES } from '@/shop/lib/categories';

const emptyForm: ServiceInput = {
    name: '',
    price: 0,
    durationMin: 60,
    category: SERVICE_CATEGORIES[0],
    description: '',
    image: '',
    isActive: true,
};

const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900/20';

export const AdminProductPage = () => {
    const { id } = useParams();
    const isNew = id === 'new';
    const navigate = useNavigate();

    const { data: existing, isLoading } = useService(isNew ? undefined : id);

    const [form, setForm] = useState<ServiceInput>(emptyForm);
    const [hydratedFrom, setHydratedFrom] = useState<string | null>(null);

    // Cuando llega el servicio a editar, se vuelca al formulario una sola vez.
    if (existing && existing.id !== hydratedFrom) {
        setHydratedFrom(existing.id);
        setForm({
            name: existing.name,
            price: existing.price,
            durationMin: existing.durationMin,
            category: existing.category,
            description: existing.description ?? '',
            image: existing.image ?? '',
            isActive: existing.isActive,
        });
    }

    const createMutation = useCreateService();
    const updateMutation = useUpdateService(id ?? '');
    const mutation = isNew ? createMutation : updateMutation;

    const set = <K extends keyof ServiceInput>(field: K, value: ServiceInput[K]) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate(form, {
            onSuccess: () => navigate('/admin/products'),
        });
    };

    const title = isNew ? 'Nuevo servicio' : 'Editar servicio';
    const subtitle = isNew
        ? 'Crea un servicio de uñas que tus clientas podrán agendar.'
        : 'Actualiza la información de este servicio.';

    if (!isNew && isLoading) {
        return <p className="py-16 text-center text-slate-500">Cargando servicio…</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
                <AdminTitle title={title} subtitle={subtitle} />
                <div className="mb-10 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        render={<Link to="/admin/products" />}
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        <SaveAll className="h-4 w-4" />
                        {mutation.isPending ? 'Guardando…' : 'Guardar'}
                    </Button>
                </div>
            </div>

            {mutation.isError && (
                <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {apiErrorMessage(mutation.error, 'No se pudo guardar el servicio.')}
                </p>
            )}

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
                                    required
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
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
                                            step="0.01"
                                            required
                                            value={form.price}
                                            onChange={(e) =>
                                                set('price', parseFloat(e.target.value) || 0)
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
                                            min={5}
                                            step={5}
                                            required
                                            value={form.durationMin}
                                            onChange={(e) =>
                                                set(
                                                    'durationMin',
                                                    parseInt(e.target.value) || 0,
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
                                    value={form.category}
                                    onChange={(e) => set('category', e.target.value)}
                                    className={inputClass}
                                >
                                    {SERVICE_CATEGORIES.map((c) => (
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
                                    value={form.description}
                                    onChange={(e) => set('description', e.target.value)}
                                    rows={5}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Describe en qué consiste el servicio y qué incluye."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra lateral */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">
                            Imagen del servicio
                        </h2>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            URL de la imagen
                        </label>
                        <input
                            type="url"
                            value={form.image}
                            onChange={(e) => set('image', e.target.value)}
                            className={inputClass}
                            placeholder="https://…"
                        />

                        {form.image ? (
                            <img
                                src={form.image}
                                alt="Vista previa"
                                className="mt-4 aspect-square w-full rounded-lg border border-slate-200 object-cover"
                            />
                        ) : (
                            <p className="mt-3 text-xs text-slate-400">
                                Si lo dejas vacío se usa una imagen por categoría.
                            </p>
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
                                checked={form.isActive}
                                onChange={(e) => set('isActive', e.target.checked)}
                                className="h-5 w-5 accent-slate-900"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
};
