import { useState } from 'react';
import { SaveAll, Upload, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { ImageCropper } from '@/admin/components/ImageCropper';
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
    name: '',
    price: 0,
    serviceId: '',
    description: '',
    image: '',
    isActive: true,
};

/**
 * Alta/edición de un diseño del catálogo. El nombre y el precio son propios
 * del diseño; el servicio agendable se elige del desplegable (los que se
 * cargan en /admin/agendar) y de él se heredan la duración y la categoría.
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
            name: existing.name,
            price: existing.price,
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
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const set = <K extends keyof CatalogItemInput>(
        field: K,
        value: CatalogItemInput[K],
    ) => setForm((prev) => ({ ...prev, [field]: value }));

    // La foto elegida no se sube directo: primero pasa por el recorte, para
    // que sea Kelin —y no el `object-cover` del navegador— quien decida qué
    // parte del diseño queda visible.
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        // Permite volver a elegir la misma foto si cancela el recorte.
        event.target.value = '';
    };

    const handleCropConfirm = (cropped: File) => {
        upload.mutate(cropped, {
            onSuccess: (url) => {
                set('image', url);
                setPendingFile(null);
            },
            onError: () => setPendingFile(null),
        });
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
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
        return <p className="py-16 text-center text-muted-foreground">Cargando diseño…</p>;
    }

    return (
        <>
        {pendingFile && (
            <ImageCropper
                file={pendingFile}
                onConfirm={handleCropConfirm}
                onCancel={() => setPendingFile(null)}
                isUploading={upload.isPending}
            />
        )}
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
                <p className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {apiErrorMessage(mutation.error, 'No se pudo guardar el diseño.')}
                </p>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-foreground">
                            Información del diseño
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label
                                    htmlFor="nombre-diseno"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Nombre del diseño
                                </label>
                                <input
                                    id="nombre-diseno"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={80}
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    className={inputClass}
                                    placeholder="Ej: Soft Glam"
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Cómo lo van a ver tus clientas en el catálogo.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
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
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Los servicios salen de{' '}
                                    <Link
                                        to="/admin/agendar"
                                        className="underline hover:text-muted-foreground"
                                    >
                                        Agendar
                                    </Link>
                                    . De ahí se heredan el nombre, el precio y la
                                    duración.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="precio-diseno"
                                    className="mb-2 block text-sm font-medium text-foreground"
                                >
                                    Precio (L.)
                                </label>
                                <input
                                    id="precio-diseno"
                                    type="number"
                                    min={0}
                                    step="1"
                                    required
                                    value={form.price}
                                    onChange={(e) =>
                                        set('price', Number.parseFloat(e.target.value) || 0)
                                    }
                                    className={inputClass}
                                    placeholder="0"
                                />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Este diseño puede costar distinto que otros del
                                    mismo servicio.
                                </p>
                            </div>

                            {selected && (
                                <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                                    <span>
                                        Precio:{' '}
                                        <strong className="text-foreground">
                                            {formatLps(selected.price)}
                                        </strong>
                                    </span>
                                    <span>
                                        Duración:{' '}
                                        <strong className="text-foreground">
                                            {formatDuration(selected.durationMin)}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
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
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">
                            Foto del diseño
                        </h2>

                        {form.image ? (
                            <div className="relative">
                                <img
                                    src={form.image}
                                    alt="Vista previa"
                                    className="aspect-square w-full rounded-lg border border-border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => set('image', '')}
                                    className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="relative block cursor-pointer rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors hover:border-input">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    disabled={upload.isPending}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium text-foreground">
                                    {upload.isPending
                                        ? 'Subiendo…'
                                        : 'Subí la foto del diseño'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG o WEBP · hasta 5 MB · vas a
                                    poder recortarla antes de subirla
                                </p>
                            </label>
                        )}

                        {upload.isError && (
                            <p className="mt-2 text-xs text-destructive">
                                {apiErrorMessage(
                                    upload.error,
                                    'No se pudo subir la imagen.',
                                )}
                            </p>
                        )}
                        <p className="mt-3 text-xs text-muted-foreground">
                            Si no subes ninguna se usa una imagen por categoría.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">
                            Visibilidad
                        </h2>

                        <label className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Visible en el catálogo
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Aparece en la página de servicios
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => set('isActive', e.target.checked)}
                                className="h-5 w-5 accent-primary"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </form>
        </>
    );
};
