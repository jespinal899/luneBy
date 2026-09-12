import { CalendarCheck, CalendarX } from 'lucide-react';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { useUpdateServiceById } from '@/admin/hooks/use-service-mutations';
import { useServices } from '@/shop/hooks/use-services';
import { formatDuration, formatLps } from '@/shop/lib/format';

/**
 * Qué servicios del catálogo aparecen como opción en /shop/agendar. El
 * catálogo público (isActive) sigue mostrando todos los diseños como
 * referencia; este módulo controla solo si se pueden agendar.
 */
export const AdminAgendarServiciosPage = () => {
    const { data, isLoading, isError } = useServices({ limit: 100 });
    const toggle = useUpdateServiceById();

    const services = (data?.products ?? []).filter((s) => s.isActive);

    const handleToggle = (
        service: NonNullable<typeof data>['products'][number],
    ) => {
        toggle.mutate({
            id: service.id,
            input: {
                name: service.name,
                price: service.price,
                category: service.category,
                durationMin: service.durationMin,
                description: service.description ?? undefined,
                image: service.image ?? undefined,
                isActive: service.isActive,
                isBookable: !service.isBookable,
            },
        });
    };

    return (
        <>
            <AdminTitle
                title="Agendar"
                subtitle="Elige qué servicios del catálogo pueden reservar las clientas en /shop/agendar. El catálogo sigue mostrando todos los diseños como referencia."
            />

            {isLoading ? (
                <p className="py-16 text-center text-slate-500">Cargando servicios…</p>
            ) : isError ? (
                <p className="py-16 text-center text-red-600">
                    No se pudieron cargar los servicios.
                </p>
            ) : services.length === 0 ? (
                <p className="py-16 text-center text-slate-500">
                    No hay servicios visibles en el catálogo todavía.
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <ul className="divide-y divide-slate-100">
                        {services.map((service) => (
                            <li
                                key={service.id}
                                className="flex items-center justify-between gap-4 px-5 py-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-900">
                                        {service.name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {service.category} · {formatLps(service.price)} ·{' '}
                                        {formatDuration(service.durationMin)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggle(service)}
                                    disabled={toggle.isPending}
                                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                                        service.isBookable
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    {service.isBookable ? (
                                        <>
                                            <CalendarCheck className="h-4 w-4" />
                                            En Agendar
                                        </>
                                    ) : (
                                        <>
                                            <CalendarX className="h-4 w-4" />
                                            Oculto de Agendar
                                        </>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {toggle.isError && (
                <p className="mt-4 text-sm text-red-600">
                    No se pudo actualizar el servicio. Intenta de nuevo.
                </p>
            )}
        </>
    );
};
