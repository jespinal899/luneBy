import { useState } from 'react';
import { SaveAll, Upload, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import {
    useAdminCatalog,
    useCreateCatalogItem,
    useUpdateCatalogItem,
} from '@/admin/hooks/use-catalog-admin';
import { useAdminServices } from '@/admin/hooks/use-admin-services';
import { useUploadImage } from '@/admin/hooks/use-upload-image';
import { apiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { formInputClass as inputClass } from '@/lib/form-styles';
import type { CatalogItemInput } from '@/shop/api/catalog.actions';
import { formatDuration, formatLps } from '@/shop/lib/format';

const emptyForm: CatalogItemInput = {
    serviceId: '',
    description: '',
    image: '',
    isActive: true,
};

/**
 * Alta/edición de una entrada del catálogo. El nombre no se escribe: se
 * elige un servicio agendable del desplegable (los que se cargan en
 * /admin/agendar) y de ahí se heredan nombre, precio y duración.
 */
export const AdminProductPage = () => {
    const { id } = useParams();
    const isNew = id === 'new';
    const navigate = useNavigate();

    // Servicios agendables disponibles para el desplegable.
    const { data: servicesData } = useAdminServices({ limit: 100 });
    const services = servicesData?.products ?? [];

    // El detalle de la entrada a editar sale del mismo listado del panel.
    const { data: catalogData, isLoading } = useAdminCatalog({ limit: 100 });
    const existing = isNew
        ? undefined
        : catalogData?.products.find((i) => i.id === id);

    const [form, setForm] = useState<CatalogItemInput>(emptyForm);
    const [hydratedFrom, setHydratedFrom] = useState<string | null>(null);

    // Cuando llega la entrada a editar, se vuelca al formulario una sola vez.
    if (existing && existing.id !== hydratedFrom) {
        setHydratedFrom(existing.id);
        setForm({
            serviceId: existing.serviceId,
            description: existing.description ?? '',
            image: existing.image ?? '',
            isActive: existing.isActive,
        });
    }

    const createMutation = useCreateCatalogItem();
    const updateMutation = useUpdateCatalogItem(id ?? '');
    const mutation = isNew ? createMutation : updateMutation;
    const upload = useUploadImage();

    const set = <K extends keyof CatalogItemInput>(
        field: K,
        value: CatalogItemInput[K],
    ) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        upload.mutate(file, { onSuccess: (url) => set('image', url) });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation.mutate(form, {
            onSuccess: () => navigate('/admin/products'),
        });
    };

    const selected = services.find((s) => s.id === form.serviceId);

    const title = isNew ? 'Nuevo diseño' : 'Editar diseño';
    const subtitle = isNew
        ? 'Agrega un diseño al catálogo que ven tus clientas.'
        : 'Actualiza la foto o el texto de este diseño.';

    if (!isNew && isLoading) {
        return <p className="py-16 text-center text-slate-500">Cargando diseño…</p>;
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
                    {apiErrorMessage(mutation.error, 'No se pudo guardar el diseño.')}
                </p>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-slate-800">
                            Información del diseño
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Servicio
                                </label>
                                <select
                                    required
                                    value={form.serviceId}
                                    onChange={(e) => set('serviceId', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="" disabled>
                                        Elige un servicio…
                                    </option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                            {s.isActive ? '' : ' (no agendable)'}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-slate-400">
                                    Los servicios salen de{' '}
                                    <Link
                                        to="/admin/agendar"
                                        className="underline hover:text-slate-600"
                                    >
                                        Agendar
                                    </Link>
                                    . De ahí se heredan el nombre, el precio y la
                                    duración.
                                </p>
                            </div>

                            {selected && (
                                <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                    <span>
                                        Categoría:{' '}
                                        <strong className="text-slate-800">
                                            {selected.category}
                                        </strong>
                                    </span>
                                    <span>
                                        Precio:{' '}
                                        <strong className="text-slate-800">
                                            {formatLps(selected.price)}
                                        </strong>
                                    </span>
                                    <span>
                                        Duración:{' '}
                                        <strong className="text-slate-800">
                                            {formatDuration(selected.durationMin)}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Descripción
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => set('description', e.target.value)}
                                    rows={5}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Describe este diseño en particular. Si lo dejas vacío se usa la descripción del servicio."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">
                            Foto del diseño
                        </h2>

                        {form.image ? (
                            <div className="relative">
                                <img
                                    src={form.image}
                                    alt="Vista previa"
                                    className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => set('image', '')}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="relative block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-slate-400">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    disabled={upload.isPending}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                <p className="mt-2 text-sm font-medium text-slate-700">
                                    {upload.isPending
                                        ? 'Subiendo…'
                                        : 'Sube la foto del diseño'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    JPG, PNG o WEBP · hasta 5 MB
                                </p>
                            </label>
                        )}

                        {upload.isError && (
                            <p className="mt-2 text-xs text-red-600">
                                {apiErrorMessage(
                                    upload.error,
                                    'No se pudo subir la imagen.',
                                )}
                            </p>
                        )}
                        <p className="mt-3 text-xs text-slate-400">
                            Si no subes ninguna se usa una imagen por categoría.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">
                            Visibilidad
                        </h2>

                        <label className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Visible en el catálogo
                                </p>
                                <p className="text-xs text-slate-400">
                                    Aparece en la página de servicios
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
